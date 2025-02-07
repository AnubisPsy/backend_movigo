const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Usuarios",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        unique: "Usuarios_id_key",
      },
      nombre: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: "Usuarios_email_key",
      },
      contraseña: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      rol: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      apellido: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "Usuarios",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "Usuarios_email_key",
          unique: true,
          fields: [{ name: "email" }],
        },
        {
          name: "Usuarios_id_key",
          unique: true,
          fields: [{ name: "id" }],
        },
        {
          name: "Usuarios_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
