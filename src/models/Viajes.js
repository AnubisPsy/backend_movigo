module.exports = function (sequelize, DataTypes) {
  const Viajes = sequelize.define(
    "Viajes",
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
      origen: {
        type: DataTypes.UUID, // Cambiado a UUID ya que es una referencia
        allowNull: true,
        references: {
          model: "Ubicaciones",
          key: "id",
        },
      },
      destino: {
        type: DataTypes.UUID, // Cambiado a UUID ya que es una referencia
        allowNull: true,
        references: {
          model: "Ubicaciones",
          key: "id",
        },
      },
      estado: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      costo: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fecha_fin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "Viajes",
      schema: "public",
      timestamps: false,
      indexes: [
        {
          name: "Viajes_pkey",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );

  // Definir las asociaciones
  Viajes.associate = (models) => {
    Viajes.belongsTo(models.Ubicaciones, {
      as: "ubicacionOrigen",
      foreignKey: "origen",
    });
    Viajes.belongsTo(models.Ubicaciones, {
      as: "ubicacionDestino",
      foreignKey: "destino",
    });
  };

  return Viajes;
};
