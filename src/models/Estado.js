const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Estado', {
    estado: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    'descripción': {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'Estado',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "Estado_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
