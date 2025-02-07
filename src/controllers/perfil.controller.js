const { Usuarios } = require("../models/init-models")(
  require("../config/database")
);

// Obtener perfil del usuario
const getPerfil = async (req, res) => {
  try {
    const { id } = req.params; // O podrías obtenerlo del token después

    const usuario = await Usuarios.findByPk(id, {
      attributes: { exclude: ["contraseña"] }, // Excluimos la contraseña
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar perfil
const updatePerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email } = req.body;

    const usuario = await Usuarios.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el nuevo email ya existe
    if (email && email !== usuario.email) {
      const emailExiste = await Usuarios.findOne({ where: { email } });
      if (emailExiste) {
        return res.status(400).json({ message: "Email ya registrado" });
      }
    }

    await usuario.update({
      nombre: nombre || usuario.nombre,
      apellido: apellido || usuario.apellido,
      email: email || usuario.email,
    });

    res.json({
      message: "Perfil actualizado exitosamente",
      usuario,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPerfil,
  updatePerfil,
};
