const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Vehiculo",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      marca: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      modelo: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      año: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      placa: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      id_conductor: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Usuarios",
          key: "id",
        },
      },
      color: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "Vehiculo",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "Vehiculo_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
