const { Vehiculo, Usuarios } = require("../models/init-models")(
  require("../config/database")
);

const obtenerVehiculos = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.findAll();
    return res.json({
      success: true,
      data: vehiculos,
    });
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener vehículos",
      error: error.message,
    });
  }
};

const obtenerVehiculoPorId = async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByPk(req.params.id);
    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado",
      });
    }
    return res.json({
      success: true,
      data: vehiculo,
    });
  } catch (error) {
    console.error("Error al obtener vehículo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener vehículo",
      error: error.message,
    });
  }
};

const gestionarVehiculo = async (req, res) => {
  try {
    const { marca, modelo, año, placa, color, id_conductor } = req.body;

    // Verificar que el usuario es conductor
    const conductor = await Usuarios.findOne({
      where: {
        id: req.user.id,
        rol: 2,
      },
    });

    if (id_conductor !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "No puedes crear/modificar vehículos para otros usuarios",
      });
    }

    if (!conductor) {
      return res.status(403).json({
        success: false,
        message: "Solo los conductores pueden gestionar vehículos",
      });
    }

    // Buscar o crear el vehículo
    const [vehiculo, created] = await Vehiculo.findOrCreate({
      where: { id_conductor: req.user.id },
      defaults: {
        marca,
        modelo,
        año,
        placa,
        color,
        id_conductor: req.user.id,
      },
    });

    // Si el vehículo ya existe, actualizarlo
    if (!created) {
      await vehiculo.update({
        marca,
        modelo,
        año,
        placa,
        color,
      });
    }

    return res.json({
      success: true,
      message: created
        ? "Vehículo creado exitosamente"
        : "Vehículo actualizado exitosamente",
      data: vehiculo,
    });
  } catch (error) {
    console.error("Error al gestionar vehículo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al gestionar vehículo",
      error: error.message,
    });
  }
};

const eliminarVehiculo = async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findOne({
      where: {
        id: req.params.id,
        id_conductor: req.user.id,
      },
    });

    if (!vehiculo) {
      return res.status(404).json({
        success: false,
        message: "Vehículo no encontrado o no autorizado",
      });
    }

    await vehiculo.destroy();

    return res.json({
      success: true,
      message: "Vehículo eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar vehículo",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerVehiculos,
  obtenerVehiculoPorId,
  gestionarVehiculo,
  eliminarVehiculo,
};
