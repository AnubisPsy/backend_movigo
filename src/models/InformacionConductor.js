const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('InformacionConductor', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    conductor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id'
      }
    },
    estado_disponibilidad: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    vehiculo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Vehiculo',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'InformacionConductor',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "InformacionConductor_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
