const express = require("express");
const router = express.Router();
const viajeController = require("../controllers/viaje.controller");
const checkRole = require("../middlewares/checkRole");

router.post("/", checkRole([1]), viajeController.crearViaje);

module.exports = router;
