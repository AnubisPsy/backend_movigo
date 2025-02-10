const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 10,
    min: 0,
    idle: 10000,
  },
  logging: console.log,
  logging: false,
  schema: "public", // Especificar schema public
  define: {
    timestamps: true,
    underscored: true,
    schema: "public", // Asegurarnos que todos los modelos usen el schema public
  },
});

module.exports = sequelize;
