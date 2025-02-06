const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario.controller");

router.get("/usuarios", usuarioController.getUsuarios);
router.post("/usuarios", usuarioController.createUsuario);

module.exports = router;
