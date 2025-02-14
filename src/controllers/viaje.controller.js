const { Sequelize } = require("sequelize");
const { Viajes, Ubicaciones, Usuarios, InformacionConductor } =
  require("../models/init-models")(require("../config/database"));

// Para pasajeros
const solicitarViaje = async (req, res) => {
  try {
    const {
      usuario_id,
      origen_referencia,
      destino_referencia,
      latitud_origen,
      longitud_origen,
    } = req.body;

    console.log("Datos recibidos:", {
      usuario_id,
      origen_referencia,
      destino_referencia,
      latitud_origen,
      longitud_origen,
    });

    // Guardar ubicación origen
    const ubicacionOrigen = await Ubicaciones.create({
      usuario_id,
      latitud: latitud_origen,
      longitud: longitud_origen,
      direccion_referencia: origen_referencia,
      timestamp: new Date(),
    });
    console.log("Ubicación origen creada:", ubicacionOrigen);

    // Guardar ubicación destino
    const ubicacionDestino = await Ubicaciones.create({
      usuario_id,
      direccion_referencia: destino_referencia,
      timestamp: new Date(),
    });
    console.log("Ubicación destino creada:", ubicacionDestino);

    // Crear el viaje
    const nuevoViaje = await Viajes.create({
      usuario_id,
      origen: ubicacionOrigen.id,
      destino: ubicacionDestino.id,
      estado: "PENDIENTE",
      fecha_inicio: new Date(),
    });

    res.status(201).json({
      message: "Viaje solicitado exitosamente",
      viaje: nuevoViaje,
    });
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({
      message: "Error al solicitar viaje",
      error: error.message,
    });
  }
};

// Para conductores
const actualizarDisponibilidad = async (req, res) => {
  try {
    const { conductor_id, disponible } = req.body;

    await InformacionConductor.update(
      { estado_disponibilidad: disponible },
      { where: { conductor_id } }
    );

    res.json({
      message: disponible ? "Conductor disponible" : "Conductor no disponible",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al actualizar disponibilidad" });
  }
};

const obtenerViajesPendientes = async (req, res) => {
  try {
    const viajesPendientes = await Viajes.findAll({
      where: { estado: "PENDIENTE" },
      include: [
        {
          model: Ubicaciones,
          as: "ubicacionOrigen",
          attributes: ["direccion_referencia", "latitud", "longitud"],
        },
        {
          model: Ubicaciones,
          as: "ubicacionDestino",
          attributes: ["direccion_referencia"],
        },
        {
          model: Usuarios,
          attributes: ["nombre", "apellido"],
        },
      ],
    });

    res.json(viajesPendientes);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al obtener viajes pendientes" });
  }
};

const aceptarViaje = async (req, res) => {
  try {
    const { viaje_id, conductor_id } = req.body;

    const viaje = await Viajes.findByPk(viaje_id);
    if (!viaje) {
      return res.status(404).json({ message: "Viaje no encontrado" });
    }

    if (viaje.estado !== "PENDIENTE") {
      return res
        .status(400)
        .json({ message: "El viaje ya no está disponible" });
    }

    await viaje.update({
      estado: "ACEPTADO",
      conductor_id,
    });

    res.json({ message: "Viaje aceptado exitosamente" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al aceptar viaje" });
  }
};

const obtenerViajeActivo = async (req, res) => {
  try {
    const { usuario_id } = req.params;
    console.log("Buscando viaje activo para usuario:", usuario_id);

    const viajeActivo = await Viajes.findOne({
      where: {
        usuario_id,
        estado: {
          [Sequelize.Op.in]: ["PENDIENTE", "ACEPTADO", "EN_CURSO"],
        },
      },
      raw: true, // Esto nos dará un objeto plano
      logging: console.log, // Esto mostrará la consulta SQL
    });

    console.log("Viaje encontrado:", viajeActivo);

    if (!viajeActivo) {
      console.log("No se encontró viaje activo");
      return res.json(null);
    }

    res.json(viajeActivo);
  } catch (error) {
    console.error("Error completo:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      message: "Error al obtener viaje activo",
      error: error.message,
      stack: error.stack,
    });
  }
};

const cancelarViaje = async (req, res) => {
  try {
    const { usuario_id } = req.body;
    const viaje = await Viajes.findOne({
      where: {
        usuario_id,
        estado: "PENDIENTE",
      },
    });

    if (!viaje) {
      return res
        .status(404)
        .json({ message: "No se encontró un viaje pendiente" });
    }

    await viaje.update({ estado: "CANCELADO" });
    res.json({
      message: "Viaje cancelado exitosamente",
      viaje: viaje,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al cancelar el viaje" });
  }
};

module.exports = {
  solicitarViaje,
  actualizarDisponibilidad,
  obtenerViajesPendientes,
  aceptarViaje,
  obtenerViajeActivo, // Añadimos los nuevos controladores
  cancelarViaje,
};
