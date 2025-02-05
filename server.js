// test-connection.js
require("dotenv").config();
const sequelize = require("./src/config/database");

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("¡Conexión establecida correctamente! 🚀");
  } catch (error) {
    console.error("Error de conexión:", error);
  } finally {
    await sequelize.close();
  }
}

testConnection();