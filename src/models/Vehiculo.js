const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Vehiculo', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    conductor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Conductores',
        key: 'id'
      }
    },
    marca: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    modelo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    'año': {
      type: DataTypes.TEXT,
      allowNull: false
    },
    placa: {
      type: DataTypes.TEXT,
      allowNull: false
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
