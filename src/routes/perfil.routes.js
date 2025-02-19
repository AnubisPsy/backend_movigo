const express = require("express");
const router = express.Router();
const { getPerfil, updatePerfil } = require("../controllers/perfil.controller");

router.get("/:id", getPerfil);
router.put("/:id", updatePerfil);

module.exports = router;
