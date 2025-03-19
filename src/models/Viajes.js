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
        type: DataTypes.TEXT, // Cambiado a TEXT por ahora
        allowNull: false,
      },
      destino: {
        type: DataTypes.TEXT, // Cambiado a TEXT por ahora
        allowNull: false,
      },
      estado: {
        type: DataTypes.INTEGER, // Cambiado a INTEGER para IDs de estado
        allowNull: false,
        references: {
          model: "Estado",
          key: "id",
        },
      },
      costo: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0,
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fecha_fin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      tiempo_cancelacion_expirado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      conductor_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      vehiculo_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      precio_propuesto: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0,
      },
      precio_final: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: 0,
      },
      estado_negociacion: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "sin_negociar",
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

  return Viajes;
};
