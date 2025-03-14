const { Ubicaciones, Viajes } = require("../models/init-models")(
  require("../config/database")
);

const actualizarUbicacion = async (req, res) => {
  try {
    const { latitud, longitud } = req.body;
    const usuario_id = req.user.id;

    // Guardar en la base de datos
    const ubicacion = await Ubicaciones.create({
      usuario_id,
      latitud,
      longitud,
      timestamp: new Date(),
    });

    // Emitir evento a través de WebSocket
    const io = req.app.get("socketio");

    // Determinar si es conductor o pasajero según el rol
    if (req.user.rol === "2") {
      // Es conductor
      const viajeActivo = await Viajes.findOne({
        where: {
          conductor_id: usuario_id,
          estado: [2, 3], // Estados ACEPTADO o EN_CURSO
        },
      });

      if (viajeActivo) {
        io.emit(`viaje-${viajeActivo.usuario_id}`, {
          tipo: "ubicacion-conductor",
          data: { latitud, longitud },
        });
      }
    } else {
      // Es pasajero
      const viajeActivo = await Viajes.findOne({
        where: {
          usuario_id: usuario_id,
          estado: [2, 3], // Estados ACEPTADO o EN_CURSO
        },
      });

      if (viajeActivo && viajeActivo.conductor_id) {
        io.emit(`viaje-${viajeActivo.conductor_id}`, {
          tipo: "ubicacion-pasajero",
          data: { latitud, longitud },
        });
      }
    }

    res.json({
      success: true,
      message: "Ubicación actualizada",
    });
  } catch (error) {
    console.error("Error al actualizar ubicación:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar ubicación",
      error: error.message,
    });
  }
};

module.exports = {
  actualizarUbicacion,
};
