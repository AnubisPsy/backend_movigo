const initModels = require("../models/init-models");
const sequelize = require("../config/database");
const { Usuarios, Op } = initModels(sequelize);

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuarios.findAll();
    //console.log("Usuarios:", usuarios); // Para debuggear

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ message: "No hay usuarios registrados" });
    }
    res.json(usuarios);
  } catch (error) {
    //console.error("Error:", error); // Para debuggear
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

const getUsuarioById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "ID de usuario requerido" });
    }
    const usuario = await Usuarios.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};

const createUsuario = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      contraseña,
      rol,
      estado_usuario = true,
    } = req.body;

    // Validar campos requeridos
    if (
      !nombre?.trim() ||
      !apellido?.trim() ||
      !email?.trim() ||
      !contraseña?.trim() ||
      !rol
    ) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Formato de email inválido" });
    }

    // Validar contraseña
    if (contraseña.length < 6) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Validar rol
    if (![1, 2, 3].includes(rol)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    const emailExistente = await Usuarios.findOne({ where: { email } });
    if (emailExistente) {
      return res.status(400).json({ message: "Email ya registrado" });
    }

    const nuevoUsuario = await Usuarios.create({
      nombre,
      apellido,
      email,
      contraseña,
      rol,
      estado_usuario,
      created_at: new Date(),
    });

    res.status(201).json({
      message: "Usuario creado exitosamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

/* const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, contraseña, rol, estado_usuario } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "ID de usuario requerido" });
    }

    const usuario = await Usuarios.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Validar formato de email si se proporciona
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Formato de email inválido" });
      }

      const emailExistente = await Usuarios.findOne({
        where: { email, id: { [Op.ne]: id } },
      });
      if (emailExistente) {
        return res.status(400).json({ message: "Email ya en uso" });
      }
    }

    // Validar contraseña si se proporciona
    if (contraseña && contraseña.length < 6) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Validar rol si se proporciona
    if (![1, 2, 3].includes(rol)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    await usuario.update({
      nombre: nombre?.trim() || usuario.nombre,
      apellido: apellido?.trim() || usuario.apellido,
      email: email?.trim() || usuario.email,
      contraseña: contraseña || usuario.contraseña,
      rol: rol || usuario.rol,
      estado_usuario:
        estado_usuario !== undefined ? estado_usuario : usuario.estado_usuario,
    });

    res.json({
      message: "Usuario actualizado exitosamente",
      usuario,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
}; */

const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID de usuario requerido" });
    }

    const usuario = await Usuarios.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await usuario.destroy();
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuarios.findByPk(id, {
      attributes: { exclude: ["contraseña"] }, // Excluimos la contraseña al obtener el perfil
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nueva función para actualizar perfil
const updateUserProfile = async (req, res) => {
  try {
    console.log("Datos recibidos:", req.body);
    console.log("Parámetros recibidos:", req.params);

    const { id } = req.params;
    const { nombre, apellido, email } = req.body;

    // Validar campos recibidos
    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
        camposFaltantes: {
          nombre: !nombre,
          apellido: !apellido,
          email: !email,
        },
      });
    }

    const usuario = await Usuarios.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar email único
    if (email !== usuario.email) {
      const emailExiste = await Usuarios.findOne({
        where: {
          email,
          id: { [Op.ne]: id },
        },
      });
      if (emailExiste) {
        return res.status(400).json({
          success: false,
          message: "Email ya registrado",
        });
      }
    }

    // Actualizar usuario
    await usuario.update({
      nombre,
      apellido,
      email,
    });

    // Excluir la contraseña de la respuesta
    const usuarioActualizado = usuario.toJSON();
    delete usuarioActualizado.contraseña;

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar perfil",
      errorDetalle: error.message,
    });
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  //updateUsuario,
  deleteUsuario,
  getUserProfile,
  updateUserProfile,
};
