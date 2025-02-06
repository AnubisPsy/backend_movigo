const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Viajes', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Usuarios',
        key: 'id'
      }
    },
    conductor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Conductores',
        key: 'id'
      }
    },
    origen: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    destino: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    estado: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    costo: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Viajes',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "Viajes_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
