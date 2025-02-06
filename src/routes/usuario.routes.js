const express = require("express");
const router = express.Router();
const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  getUsuarioByUsername,
} = require("../controllers/usuario.controller");

router.get("/", getUsuarios);
router.get("/:id", getUsuarioById);
router.get("/username/:username", getUsuarioByUsername);
router.post("/", createUsuario);
router.put("/:id", updateUsuario);

module.exports = router;
