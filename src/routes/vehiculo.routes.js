const express = require("express");
const router = express.Router();
const vehiculoController = require("../controllers/vehiculo.controller");
const checkRole = require("../middlewares/checkRole");

router.get("/", vehiculoController.obtenerVehiculos); // Listar todos
router.get("/:id", vehiculoController.obtenerVehiculoPorId); // Obtener uno
router.post("/", checkRole([2]), vehiculoController.gestionarVehiculo); // Crear
router.put("/", checkRole([2]), vehiculoController.gestionarVehiculo); // Actualizar
router.delete("/:id", checkRole([2]), vehiculoController.eliminarVehiculo); // Eliminar

module.exports = router;
