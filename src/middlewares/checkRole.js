// middlewares/checkRole.js
const sequelize = require("../config/database");
const { Usuarios } = require("../models/init-models")(sequelize);

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.headers["user-id"] || req.body.usuario_id;
      console.log("\n=== DEBUG CHECK ROLE ===");
      console.log("userId:", userId);
      console.log("allowedRoles:", allowedRoles, typeof allowedRoles[0]);

      const usuario = await Usuarios.findByPk(userId);
      console.log("Usuario encontrado:", {
        id: usuario?.id,
        email: usuario?.email,
        rol: usuario?.rol,
        tipoDato: typeof usuario?.rol,
      });

      if (!usuario) {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      const rolUsuario = parseInt(usuario.rol);
      console.log("Comparación de roles:", {
        rolUsuario,
        tipoRolUsuario: typeof rolUsuario,
        allowedRoles,
        includes: allowedRoles.includes(rolUsuario),
      });

      if (!allowedRoles.includes(rolUsuario)) {
        return res.status(403).json({
          message: "No tienes permiso para acceder a este recurso",
        });
      }

      req.user = usuario;
      next();
    } catch (error) {
      console.error("Error en checkRole:", error);
      res.status(500).json({
        message: "Error al verificar rol",
        error: error.message,
      });
    }
  };
};

module.exports = checkRole;
