const express = require("express");
const checkRole = require("../middlewares/checkRole");
const router = express.Router();
const {
  login,
  register,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyCode,
} = require("../controllers/auth.controller");

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-password", updatePassword);
router.post("/verify-code", verifyCode);

module.exports = router;
