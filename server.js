require("dotenv").config();
const express = require("express");
const sequelize = require("./src/config/database");
const initModels = require("./src/models/init-models");
const usuarioRoutes = require("./src/routes/usuario.routes");
const authRoutes = require("./src/routes/auth.routes");
const perfilRoutes = require("./src/routes/perfil.routes");

const app = express();
const PORT = process.env.PORT || 3000;

const models = initModels(sequelize); // Añade esta línea
const cors = require("cors");

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
app.use("/api/perfil", perfilRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Error interno del servidor",
    error: err.message,
  });
});

// Iniciamos el servidor
async function initializeServer() {
  try {
    await sequelize.authenticate();
    console.log("¡Conexión establecida! 🚀");
    await sequelize.sync({ force: false });

    const server = app.listen(PORT, "0.0.0.0", () => {
      const addresses = Object.values(require("os").networkInterfaces())
        .flat()
        .filter((item) => !item.internal && item.family === "IPv4")
        .map((item) => item.address);

      console.log("Servidor escuchando en:");
      console.log("Direcciones IP disponibles:", addresses);
      console.log(`Puerto: ${PORT} 🔥`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

initializeServer();
