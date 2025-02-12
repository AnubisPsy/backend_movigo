const express = require("express");
const router = express.Router();
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyCode,
} = require("../controllers/auth.controller");
const { getPerfil, updatePerfil } = require("../controllers/perfil.controller");

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/password", updatePassword); // Mover esta ruta antes de las rutas con parámetros
router.get("/:id", getPerfil);
router.put("/:id", updatePerfil);
router.post("/verify-code", verifyCode);

module.exports = router;