const Sequelize = require("sequelize");
const conductoresModel = require("./Conductores");
const pagosModel = require("./Pagos");
const rolesModel = require("./Roles");
const usuariosModel = require("./Usuarios");
const vehiculoModel = require("./Vehiculo");
const viajesModel = require("./Viajes");

function initModels(sequelize) {
  const DataTypes = Sequelize.DataTypes;

  // Inicializar modelos
  const Conductores = conductoresModel(sequelize, DataTypes);
  const Pagos = pagosModel(sequelize, DataTypes);
  const Roles = rolesModel(sequelize, DataTypes);
  const Usuarios = usuariosModel(sequelize, DataTypes);
  const Vehiculo = vehiculoModel(sequelize, DataTypes);
  const Viajes = viajesModel(sequelize, DataTypes);

  // Definir relaciones
  Usuarios.hasMany(Viajes, { foreignKey: "usuario_id" });
  Viajes.belongsTo(Usuarios, { foreignKey: "usuario_id" });

  Conductores.hasMany(Viajes, { foreignKey: "conductor_id" });
  Viajes.belongsTo(Conductores, { foreignKey: "conductor_id" });

  Viajes.hasOne(Pagos, { foreignKey: "viaje_id" });
  Pagos.belongsTo(Viajes, { foreignKey: "viaje_id" });

  return {
    Conductores,
    Pagos,
    Roles,
    Usuarios,
    Vehiculo,
    Viajes,
  };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
