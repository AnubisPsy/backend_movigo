const supabase = require("../config/supabase");
const { Usuarios, RecuperarContraseña } = require("../models/init-models")(
  require("../config/database")
);
const { Op } = require("sequelize"); // Añade esta línea
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;
    console.log("Login intento:", email);

    if (!email || !contraseña) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son requeridos" });
    }

    const usuario = await Usuarios.findOne({ where: { email } });
    console.log("Usuario encontrado:", usuario?.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(contraseña, usuario.contraseña);
    console.log("Password válido:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Auth con Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: contraseña,
      });
      if (error) console.error("Error Supabase:", error);
    } catch (e) {
      console.error("Error Supabase auth:", e);
    }

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
    console.error("Error login:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

const register = async (req, res) => {
  try {
    const { email, contraseña, nombre, apellido, rol = 1 } = req.body;

    // Primero verificamos si el usuario existe
    const usuarioExistente = await Usuarios.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "Email ya registrado" });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Primero creamos el usuario en nuestra base de datos
    const nuevoUsuario = await Usuarios.create({
      email,
      contraseña: hashedPassword,
      nombre,
      apellido,
      rol,
    });

    // Luego intentamos crear el usuario en Supabase
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: contraseña,
        options: {
          data: {
            nombre,
            apellido,
            rol,
          },
        },
      });

      if (authError) {
        console.error("Error Supabase:", authError);
        // Aún si falla Supabase, ya tenemos el usuario en nuestra DB
      }
    } catch (supabaseError) {
      console.error("Error en Supabase:", supabaseError);
      // No devolvemos error, continuamos porque el usuario ya está en nuestra DB
    }

    // Devolvemos éxito
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
    console.error("Error general:", error);
    res.status(500).json({
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

const transporter = require("../config/mailer");

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
