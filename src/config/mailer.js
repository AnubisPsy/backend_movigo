const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verificar conexión
transporter.verify(function (error, success) {
  if (error) {
    console.log("Error al configurar el email:", error);
  } else {
    console.log("Servidor listo para enviar emails");
  }
});

module.exports = transporter;
