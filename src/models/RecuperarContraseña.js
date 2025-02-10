const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "RecuperarContraseña",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      usuario_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Usuarios",
          key: "id",
        },
      },
      code: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      used: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "RecuperarContraseña",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "passwordresets_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
