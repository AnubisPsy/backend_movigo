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

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT} 🔥`));
  } catch (error) {
    console.error("Error:", error);
  }
}

initializeServer();
