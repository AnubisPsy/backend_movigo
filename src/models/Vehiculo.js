const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Vehiculo', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    marca: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    modelo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'año': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    placa: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_conductor: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Usuarios',
        key: 'id'
      }
    },
    color: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Vehiculo',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "Vehiculo_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
