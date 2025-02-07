var DataTypes = require("sequelize").DataTypes;
var _Estado = require("./Estado");
var _InformacionConductor = require("./InformacionConductor");
var _Roles = require("./Roles");
var _Ubicaciones = require("./Ubicaciones");
var _Usuarios = require("./Usuarios");
var _Vehiculo = require("./Vehiculo");
var _Viajes = require("./Viajes");

function initModels(sequelize) {
  var Estado = _Estado(sequelize, DataTypes);
  var InformacionConductor = _InformacionConductor(sequelize, DataTypes);
  var Roles = _Roles(sequelize, DataTypes);
  var Ubicaciones = _Ubicaciones(sequelize, DataTypes);
  var Usuarios = _Usuarios(sequelize, DataTypes);
  var Vehiculo = _Vehiculo(sequelize, DataTypes);
  var Viajes = _Viajes(sequelize, DataTypes);

  Usuarios.belongsTo(Roles, { as: "rol_Role", foreignKey: "rol"});
  Roles.hasMany(Usuarios, { as: "Usuarios", foreignKey: "rol"});
  InformacionConductor.belongsTo(Usuarios, { as: "conductor", foreignKey: "conductor_id"});
  Usuarios.hasMany(InformacionConductor, { as: "InformacionConductors", foreignKey: "conductor_id"});
  Ubicaciones.belongsTo(Usuarios, { as: "usuario", foreignKey: "usuario_id"});
  Usuarios.hasMany(Ubicaciones, { as: "Ubicaciones", foreignKey: "usuario_id"});
  Vehiculo.belongsTo(Usuarios, { as: "id_conductor_Usuario", foreignKey: "id_conductor"});
  Usuarios.hasMany(Vehiculo, { as: "Vehiculos", foreignKey: "id_conductor"});
  Viajes.belongsTo(Usuarios, { as: "usuario", foreignKey: "usuario_id"});
  Usuarios.hasMany(Viajes, { as: "Viajes", foreignKey: "usuario_id"});
  InformacionConductor.belongsTo(Vehiculo, { as: "vehiculo_Vehiculo", foreignKey: "vehiculo"});
  Vehiculo.hasMany(InformacionConductor, { as: "InformacionConductors", foreignKey: "vehiculo"});

  return {
    Estado,
    InformacionConductor,
    Roles,
    Ubicaciones,
    Usuarios,
    Vehiculo,
    Viajes,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
