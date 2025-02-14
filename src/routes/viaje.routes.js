// src/routes/viaje.routes.js
const express = require("express");
const router = express.Router();
const checkRole = require("../middlewares/checkRole");
const {
  solicitarViaje,
  actualizarDisponibilidad,
  obtenerViajesPendientes,
  aceptarViaje,
  obtenerViajeActivo,
  cancelarViaje,
} = require("../controllers/viaje.controller");

router.post("/solicitar", checkRole([1]), solicitarViaje);
router.put("/disponibilidad", checkRole([2]), actualizarDisponibilidad);
router.get("/pendientes", checkRole([2]), obtenerViajesPendientes);
router.post("/aceptar", checkRole([2]), aceptarViaje);
router.get("/activo/:usuario_id", obtenerViajeActivo);
router.post("/cancelar", cancelarViaje);

module.exports = router;
