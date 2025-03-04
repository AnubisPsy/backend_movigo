const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "InformacionConductor",
    {
      id: {
        autoIncrement: true,
        autoIncrementIdentity: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      conductor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Usuarios",
          key: "id",
        },
      },
      vehiculo: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Vehiculo",
          key: "id",
        },
      },
      tarifa_base: {
        type: DataTypes.NUMERIC,
        allowNull: false,
        defaultValue: 0,
      },
      tipo_tarifa: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: "HORA", // o 'DISTANCIA'
      },
    },
    {
      sequelize,
      tableName: "InformacionConductor",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "InformacionConductor_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
