// src/routes/informacionConductor.routes.js
const express = require("express");
const router = express.Router();
const {
  createInformacionConductor,
  updateInformacionConductor,
  getInformacionConductor,
} = require("../controllers/informacionConductor.controller");
const authMiddleware = require("../middlewares/auth");
const checkRole = require("../middlewares/checkRole");

// Middleware
router.use(authMiddleware);
router.use(checkRole([2]));

// Rutas
router.post("/", createInformacionConductor);
router.put("/", updateInformacionConductor);
router.get("/", getInformacionConductor);

module.exports = router;
