const express = require("express");
const router = express.Router();
const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/usuario.controller");

// Rutas de administración de usuarios
router.get("/", getUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", createUsuario);
//router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);

// Rutas de perfil
router.get("/profile/:id", getUserProfile);
router.put('/:id', updateUserProfile);

module.exports = router;
