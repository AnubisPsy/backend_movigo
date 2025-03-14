require("dotenv").config();
const express = require("express");
const http = require("http"); // Agregar esta línea
const { Server } = require("socket.io"); // Agregar esta línea
const sequelize = require("./src/config/database");
const initModels = require("./src/models/init-models");
const usuarioRoutes = require("./src/routes/usuario.routes");
const authRoutes = require("./src/routes/auth.routes");
const viajeRoutes = require("./src/routes/viaje.routes");
const vehiculoRoutes = require("./src/routes/vehiculo.routes");
const informacionConductorRoutes = require("./src/routes/informacionConductor.routes");
const app = express();
const PORT = process.env.PORT || 3000;
const models = initModels(sequelize);
const cors = require("cors");
const ubicacionRoutes = require("./src/routes/ubicacion.routes");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/test", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/viajes", viajeRoutes);
app.use("/api/vehiculos", vehiculoRoutes);
app.use("/api/conductor/info", informacionConductorRoutes);
app.use("/api/ubicacion", ubicacionRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Error interno del servidor",
    error: err.message,
  });
});

// Iniciamos el servidor con Socket.IO
async function initializeServer() {
  try {
    await sequelize.authenticate();
    console.log("¡Conexión establecida! 🚀");
    await sequelize.sync({ force: false });

    // Crear servidor HTTP con Express
    const server = http.createServer(app);

    // Inicializar Socket.IO en el servidor HTTP
    const io = new Server(server, {
      cors: {
        origin: "*", // Permitir conexiones desde cualquier origen en desarrollo
        methods: ["GET", "POST"],
      },
    });

    // Guardar referencia a io en app para usarlo en otros archivos
    app.set("socketio", io);

    // Configurar Socket.IO
    io.on("connection", (socket) => {
      console.log("Cliente conectado:", socket.id);

      // Autenticación del socket
      socket.on("authenticate", (token) => {
        try {
          // Aquí deberías verificar el token (puedes usar la misma lógica que en tu middleware de autenticación)
          // Por ahora, simplemente registramos que se intentó autenticar
          console.log("Cliente intentó autenticarse:", socket.id);
          // En un caso real, aquí verificarías el token y asociarías el socket con el usuario
        } catch (error) {
          console.error("Error de autenticación:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
      });
    });

    // Iniciar el servidor
    server.listen(PORT, "0.0.0.0", () => {
      const addresses = Object.values(require("os").networkInterfaces())
        .flat()
        .filter((item) => !item.internal && item.family === "IPv4")
        .map((item) => item.address);
      console.log("Servidor escuchando en:");
      console.log("Direcciones IP disponibles:", addresses);
      console.log(`Puerto: ${PORT} 🔥`);
      console.log("Socket.IO inicializado correctamente ⚡");
    });

    // Exportar io para usarlo en otros archivos si es necesario
    global.io = io;
  } catch (error) {
    console.error("Error:", error);
  }
}

initializeServer();
