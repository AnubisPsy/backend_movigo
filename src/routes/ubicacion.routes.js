const express = require("express");
const router = express.Router();
const { actualizarUbicacion } = require("../controllers/ubicacion.controller");
const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, actualizarUbicacion);

module.exports = router;
