const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Pagos', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    viaje_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Viajes',
        key: 'id'
      }
    },
    metodo_pago: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    monto: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    referencia_pago: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Pagos',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "Pagos_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
