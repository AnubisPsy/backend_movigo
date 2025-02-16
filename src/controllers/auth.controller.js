const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Usuarios, RecuperarContraseña } = require("../models/init-models")(
  require("../config/database")
);
const { Op } = require("sequelize");
const transporter = require("../config/mailer");

const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuarios.findOne({
      where: { email },
    });

    if (!usuario || !(await bcrypt.compare(password, usuario.contraseña))) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    // Crear un JWT válido
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
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
    const { email, contraseña, nombre, apellido, rol = 1 } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuarios.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Hash de la contraseña antes de crear el usuario
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear usuario con la contraseña hasheada
    const nuevoUsuario = await Usuarios.create({
      email,
      contraseña: hashedPassword, // Usar la contraseña hasheada
      nombre,
      apellido,
      rol,
      estado_usuario: true,
    });

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
    console.error("Error:", error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

// const transporter = require("../config/mailer");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Email recibido:", email);

    // Buscar usuario
    const usuario = await Usuarios.findOne({ where: { email } });
    console.log("Usuario encontrado:", usuario ? "Sí" : "No");

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar código
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Código generado:", code);

    // Configurar el correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Recuperación de Contraseña - MoviGO",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Recuperación de Contraseña</h2>
          <p>Has solicitado recuperar tu contraseña. Utiliza el siguiente código:</p>
          <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px;">
            <strong>${code}</strong>
          </div>
          <p>Este código expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Saludos,<br>Equipo MoviGO</p>
        </div>
      `,
    };

    // Intentar enviar el correo
    console.log("Intentando enviar correo...");
    await transporter.sendMail(mailOptions);
    console.log("Correo enviado exitosamente");

    // Crear registro de recuperación
    await RecuperarContraseña.create({
      usuario_id: usuario.id,
      code: code,
      expires_at: new Date(Date.now() + 3600000), // 1 hora
      used: false,
    });
    console.log("Registro de recuperación creado");

    res.json({
      message: "Código de recuperación enviado",
    });
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    console.log("Datos recibidos:", { email, code });

    // Buscar usuario
    const usuario = await Usuarios.findOne({ where: { email } });
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

    if (!resetRequest) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await usuario.update({ contraseña: hashedPassword });

    // Eliminar el registro de recuperación de contraseña
    await resetRequest.destroy();

    // También podemos eliminar cualquier otro código expirado o usado
    await RecuperarContraseña.destroy({
      where: {
        [Op.or]: [
          { expires_at: { [Op.lt]: new Date() } }, // Códigos expirados
          { used: true }, // Códigos ya usados
        ],
      },
    });

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al actualizar contraseña" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;
    console.log("Datos recibidos:", { id, currentPassword, newPassword }); // Para debug

    // Validar UUID
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        id
      )
    ) {
      return res.status(400).json({ message: "ID inválido" });
    }

    // Buscar usuario
    const usuario = await Usuarios.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar contraseña actual
    const contraseñaValida = await bcrypt.compare(
      currentPassword,
      usuario.contraseña
    );
    if (!contraseñaValida) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await usuario.update({ contraseña: hashedPassword });

    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al actualizar contraseña" });
  }
};

// En auth.controller.js
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const usuario = await Usuarios.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

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

    if (!resetRequest) {
      return res.status(400).json({ message: "Código inválido o expirado" });
    }

    res.json({ message: "Código válido" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error al verificar código" });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyCode,
};
