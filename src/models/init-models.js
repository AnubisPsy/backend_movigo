var DataTypes = require("sequelize").DataTypes;

function initModels(sequelize) {
  // Importar modelos
  const Usuarios = require("./Usuarios")(sequelize, DataTypes);
  const Estado = require("./Estado")(sequelize, DataTypes);
  const Viajes = require("./Viajes")(sequelize, DataTypes);
  const Vehiculo = require("./Vehiculo")(sequelize, DataTypes);
  const RecuperarContraseña = require("./RecuperarContraseña")(
    sequelize,
    DataTypes
  );
  const InformacionConductor = require("./InformacionConductor")(
    sequelize,
    DataTypes
  );
  const Ubicaciones = require("./Ubicaciones")(sequelize, DataTypes);
  const Roles = require("./Roles")(sequelize, DataTypes);

  // Relaciones

  // Usuarios - Roles
  Usuarios.belongsTo(Roles, { foreignKey: "rol" });
  Roles.hasMany(Usuarios, { foreignKey: "rol" });

  // Usuarios - Viajes
  Usuarios.hasMany(Viajes, { foreignKey: "usuario_id" });
  Viajes.belongsTo(Usuarios, { foreignKey: "usuario_id" });

  // Usuarios - RecuperarContraseña
  Usuarios.hasMany(RecuperarContraseña, { foreignKey: "usuario_id" });
  RecuperarContraseña.belongsTo(Usuarios, { foreignKey: "usuario_id" });

  // Usuarios - InformacionConductor
  Usuarios.hasOne(InformacionConductor, { foreignKey: "conductor_id" });
  InformacionConductor.belongsTo(Usuarios, { foreignKey: "conductor_id" });

  // InformacionConductor - Vehiculo
  InformacionConductor.hasOne(Vehiculo, {
    foreignKey: "id_conductor",
    sourceKey: "conductor_id", // Añadir esta línea
  });
  Vehiculo.belongsTo(InformacionConductor, {
    foreignKey: "id_conductor",
    targetKey: "conductor_id", // Añadir esta línea
  });

  Viajes.belongsTo(Usuarios, {
    as: "Conductor",
    foreignKey: "conductor_id",
  });

  // Relación con vehículo
  Viajes.belongsTo(Vehiculo, {
    foreignKey: "vehiculo_id",
  });

  // Usuarios - Ubicaciones
  Usuarios.hasMany(Ubicaciones, { foreignKey: "usuario_id" });
  Ubicaciones.belongsTo(Usuarios, { foreignKey: "usuario_id" });

  // Viajes - Estado
  Viajes.belongsTo(Estado, { foreignKey: "estado" });
  Estado.hasMany(Viajes, { foreignKey: "estado" });

  return {
    Usuarios,
    Estado,
    Viajes,
    Vehiculo,
    RecuperarContraseña,
    InformacionConductor,
    Ubicaciones,
    Roles,
  };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
