const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Conductores', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    licencia: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    vehiculo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Conductores',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "Conductores_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
