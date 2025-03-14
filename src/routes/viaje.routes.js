const express = require("express");
const router = express.Router();
const viajeController = require("../controllers/viaje.controller");
const checkRole = require("../middlewares/checkRole");
const authMiddleware = require("../middlewares/auth");

// Aplicar SOLO el middleware de autenticación globalmente
router.use(authMiddleware);

// Rutas específicas con sus propios roles
router.get("/historial", authMiddleware, viajeController.obtenerHistorial);
router.post("/", checkRole([1]), viajeController.crearViaje);
router.put("/:id/tomar", checkRole([2]), viajeController.tomarViaje);
router.get("/", viajeController.obtenerViaje);
router.get("/:id", viajeController.obtenerViaje);
router.put("/:id/iniciar", checkRole([2]), viajeController.iniciarViaje);
router.put("/:id/completar", checkRole([2]), viajeController.completarViaje);
router.put("/:id/cancelar", viajeController.cancelarViaje);

module.exports = router;
