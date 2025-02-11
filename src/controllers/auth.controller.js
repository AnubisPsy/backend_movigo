//const supabase = require("../config/supabase");
const { Usuarios, RecuperarContraseña } = require("../models/init-models")(
  require("../config/database")
);
const { Op } = require("sequelize"); // Añade esta línea
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;
    console.log("Iniciando proceso de login");
    console.log("Email:", email);

    // 1. Buscar usuario
    const usuario = await Usuarios.findOne({
      where: { email },
      raw: true, // Esto nos dará el objeto plano
    });

    console.log("Usuario encontrado:", usuario ? "Sí" : "No");

    if (!usuario) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // 2. Comparar contraseña directamente con bcrypt
    const contraseñaValida = await bcrypt.compare(
      contraseña,
      usuario.contraseña
    );
    console.log("Contraseña recibida:", contraseña);
    console.log("Hash almacenado:", usuario.contraseña);
    console.log("¿Contraseña válida?:", contraseñaValida);

    if (!contraseñaValida) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // 3. Login exitoso
    res.json({
      message: "Login exitoso",
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const { email, contraseña, nombre, apellido } = req.body;
    const rol = parseInt(req.body.rol) || 1;

    // Verificar usuario existente
    const usuarioExistente = await Usuarios.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Crear usuario (el modelo se encargará de hashear la contraseña)
    const nuevoUsuario = await Usuarios.create({
      email,
      contraseña, // Pasar la contraseña sin hashear
      nombre,
      apellido,
      rol,
      estado_usuario: true,
    });

    // Log para verificar
    console.log("Contraseña original:", contraseña);
    console.log("Contraseña guardada:", nuevoUsuario.contraseña);

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error("Error detallado en registro:", error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

// const transporter = require("../config/mailer");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Email recibido:", email); // Debug

    const usuario = await Usuarios.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar código
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Código generado:", code); // Debug

    // Crear registro de recuperación
    await RecuperarContraseña.create({
      usuario_id: usuario.id,
      code: code,
      expires_at: new Date(Date.now() + 3600000), // 1 hora
      used: false,
    });

    res.json({
      message: "Código de recuperación enviado",
      code: code, // Solo para testing
    });
  } catch (error) {
    console.error("Error detallado:", error); // Debug
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    console.log("Datos recibidos:", { email, code }); // Debug

    // Buscar usuario
    const usuario = await Usuarios.findOne({ where: { email } });
    console.log("Usuario encontrado:", usuario?.id); // Debug

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Buscar código de recuperación válido
    const resetRequest = await RecuperarContraseña.findOne({
      where: {
        usuario_id: usuario.id,
        code: code,
        used: false,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });
    console.log("Solicitud de reset encontrada:", resetRequest?.id); // Debug

    if (!resetRequest) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("Password hasheada generada"); // Debug

    // Actualizar contraseña
    await usuario.update({ contraseña: hashedPassword });
    console.log("Contraseña actualizada"); // Debug

    // Marcar código como usado
    await resetRequest.update({ used: true });
    console.log("Código marcado como usado"); // Debug

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error detallado:", error); // Debug completo del error
    res.status(500).json({ message: "Error al actualizar contraseña" });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
};
