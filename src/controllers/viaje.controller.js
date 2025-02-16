const { Viajes, Usuarios } = require("../models/init-models")(
  require("../config/database")
);

const crearViaje = async (req, res) => {
  try {
    const { origen, destino } = req.body;
    const usuario_id = req.user.id;

    // Verificar que el usuario es un pasajero (rol 1)
    const usuario = await Usuarios.findOne({
      where: {
        id: usuario_id,
        rol: 1,
      },
    });

    if (!usuario) {
      return res.status(403).json({
        success: false,
        message: "Solo los pasajeros pueden crear viajes",
      });
    }

    // Crear el viaje
    const viaje = await Viajes.create({
      usuario_id,
      origen,
      destino,
      estado: "PENDIENTE",
      created_at: new Date(),
    });

    // Configurar timer de 5 minutos para cancelación
    setTimeout(async () => {
      const viajeActual = await Viajes.findByPk(viaje.id);
      if (viajeActual && viajeActual.estado === "PENDIENTE") {
        viajeActual.tiempo_cancelacion_expirado = true;
        await viajeActual.save();
      }
    }, 5 * 60 * 1000); // 5 minutos

    // Configurar timer de 15 minutos para auto-cancelación
    setTimeout(async () => {
      const viajeActual = await Viajes.findByPk(viaje.id);
      if (viajeActual && viajeActual.estado === "PENDIENTE") {
        viajeActual.estado = "CANCELADO";
        viajeActual.fecha_fin = new Date();
        await viajeActual.save();
      }
    }, 15 * 60 * 1000); // 15 minutos

    res.status(201).json({
      success: true,
      message: "Viaje creado exitosamente",
      data: viaje,
    });
  } catch (error) {
    console.error("Error al crear viaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear viaje",
      error: error.message,
    });
  }
};

module.exports = {
  crearViaje,
};
