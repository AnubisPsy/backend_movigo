const supabase = require("../config/supabase");
const { Usuarios } = require("../models/init-models")(
  require("../config/database")
);
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({
        message: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario en nuestra base de datos
    const usuario = await Usuarios.findOne({
      where: { email },
      raw: true, // Agregamos esto para obtener un objeto plano
    });

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Verificar contraseña usando bcrypt
    const validPassword = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!validPassword) {
      return res.status(401).json({
        message: "Contraseña incorrecta",
      });
    }

    // Si la autenticación es exitosa
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: contraseña,
    });

    if (error) {
      console.error("Error Supabase:", error);
      // Aún si falla Supabase, podemos autenticar con nuestra DB
    }

    res.json({
      message: "Login exitoso",
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
      session: data?.session || null,
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

module.exports = {
  login,
  register,
};
