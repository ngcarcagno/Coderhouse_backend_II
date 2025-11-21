/**
 * PASSWORD RESET ROUTES
 * Rutas para recuperación de contraseña
 */

const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/password.controller");

/**
 * RUTAS PÚBLICAS (No requieren autenticación)
 */

// POST /api/password/request-reset
// Solicita un token de recuperación de contraseña
router.post("/request-reset", passwordController.requestPasswordReset);

// GET /api/password/verify-token/:token
// Verifica si un token de recuperación es válido
router.get("/verify-token/:token", passwordController.verifyResetToken);

// POST /api/password/reset
// Restablece la contraseña usando el token
router.post("/reset", passwordController.resetPassword);

module.exports = router;
