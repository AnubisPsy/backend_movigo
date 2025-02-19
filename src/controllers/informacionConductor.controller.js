const { InformacionConductor, Vehiculo } = require("../models/init-models")(
  require("../config/database")
);

// Crear información del conductor
const createInformacionConductor = async (req, res) => {
  try {
    const conductor_id = req.user.id;
    const { tarifa_base, tipo_tarifa } = req.body;

    // Verificar si ya existe información
    const existingInfo = await InformacionConductor.findOne({
      where: { conductor_id },
    });

    if (existingInfo) {
      return res.status(400).json({
        success: false,
        message:
          "Ya existe información para este conductor. Use PUT para actualizar.",
      });
    }

    const conductorInfo = await InformacionConductor.create({
      conductor_id,
      tarifa_base,
      tipo_tarifa,
    });

    res.status(201).json({
      success: true,
      message: "Información de conductor creada exitosamente",
      data: conductorInfo,
    });
  } catch (error) {
    console.error("Error al crear información del conductor:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear información del conductor",
      error: error.message,
    });
  }
};

// Actualizar información del conductor
const updateInformacionConductor = async (req, res) => {
  try {
    const conductor_id = req.user.id;
    const { tarifa_base, tipo_tarifa } = req.body;

    const conductorInfo = await InformacionConductor.findOne({
      where: { conductor_id },
    });

    if (!conductorInfo) {
      return res.status(404).json({
        success: false,
        message:
          "No se encontró información del conductor. Use POST para crear.",
      });
    }

    await conductorInfo.update({
      tarifa_base,
      tipo_tarifa,
    });

    res.json({
      success: true,
      message: "Información de conductor actualizada exitosamente",
      data: conductorInfo,
    });
  } catch (error) {
    console.error("Error al actualizar información del conductor:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar información del conductor",
      error: error.message,
    });
  }
};

// Obtener información del conductor
const getInformacionConductor = async (req, res) => {
  try {
    const conductor_id = req.user.id;

    const conductorInfo = await InformacionConductor.findOne({
      where: { conductor_id },
      include: [
        {
          model: Vehiculo,
          required: false, // Hace que sea LEFT JOIN
          attributes: ["id", "marca", "modelo", "año", "placa", "color"],
        },
      ],
    });

    if (!conductorInfo) {
      return res.status(404).json({
        success: false,
        message: "No se encontró información del conductor",
      });
    }

    res.json({
      success: true,
      data: conductorInfo,
    });
  } catch (error) {
    console.error("Error al obtener información del conductor:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener información del conductor",
      error: error.message,
    });
  }
};

module.exports = {
  createInformacionConductor,
  updateInformacionConductor,
  getInformacionConductor,
};
