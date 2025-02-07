const { Usuarios } = require("../models/init-models")(
  require("../config/database")
);

// Obtener todos los usuarios
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuarios.findAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un usuario por ID
const getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuarios.findByPk(req.params.id);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Para crear usuario
const createUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, contraseña, rol } = req.body;

    // Verificar campos requeridos
    if (!nombre || !apellido || !email || !contraseña || !rol) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
      });
    }

    // Verificar si el email ya existe
    const emailExistente = await Usuarios.findOne({ where: { email } });
    if (emailExistente) {
      return res.status(400).json({
        message: "El correo electrónico ya está registrado",
      });
    }

    const nuevoUsuario = await Usuarios.create({
      nombre,
      apellido,
      email,
      contraseña,
      rol,
    });

    res.status(201).json({
      message: "Usuario creado exitosamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al crear usuario",
      error: error.message,
    });
  }
};

// Para actualizar usuario
const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, contraseña, rol } = req.body;

    const usuario = await Usuarios.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Si se está actualizando el email, verificar que no exista
    if (email && email !== usuario.email) {
      const emailExistente = await Usuarios.findOne({
        where: {
          email,
          id: { [Op.ne]: id }, // Excluir el usuario actual de la búsqueda
        },
      });

      if (emailExistente) {
        return res.status(400).json({
          message: "El correo electrónico ya está en uso por otro usuario",
        });
      }
    }

    await usuario.update({
      nombre: nombre || usuario.nombre,
      apellido: apellido || usuario.apellido,
      email: email || usuario.email,
      contraseña: contraseña || usuario.contraseña,
      rol: rol || usuario.rol,
    });

    res.json({
      message: "Usuario actualizado exitosamente",
      usuario,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
};

// Eliminar un usuario
const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuarios.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    await usuario.destroy();
    res.json({
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
