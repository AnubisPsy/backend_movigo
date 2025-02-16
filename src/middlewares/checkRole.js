const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      console.log("=== DEBUG CHECK ROLE ===");
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("No se encontró token válido");
        return res.status(401).json({
          message: "No autorizado",
          error: "Token no proporcionado",
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token decodificado:", decoded);

      if (!allowedRoles.includes(parseInt(decoded.rol))) {
        return res.status(403).json({
          message: "No autorizado",
          error: "Rol insuficiente",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error("Error en checkRole:", error);
      return res.status(401).json({
        message: "No autorizado",
        error: "jwt malformed",
      });
    }
  };
};

module.exports = checkRole;
