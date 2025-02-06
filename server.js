require("dotenv").config();
const express = require("express");
const sequelize = require("./src/config/database");
const initModels = require("./src/models/init-models");

const usuarioRoutes = require("./src/routes/usuario.routes.js");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/usuarios", usuarioRoutes);

// Inicializar modelos
const models = initModels(sequelize);

// Rutas básicas de prueba
app.get("/", (req, res) => {
  res.send("¡API de MoviGO funcionando! 🚗");
});

// Inicialización del servidor y base de datos
async function initializeServer() {
  try {
    // Probar conexión
    await sequelize.authenticate();
    console.log("¡Conexión a la base de datos establecida! 🚀");

    // Sincronizar modelos (false para no recrear las tablas)
    await sequelize.sync({ force: false });
    console.log("Modelos sincronizados correctamente ✅");

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT} 🔥`);
    });
  } catch (error) {
    console.error("Error al inicializar:", error);
  }
}

initializeServer();
