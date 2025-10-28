const express = require("express");
const router = express.Router();
const sessionsController = require("../controllers/sessions.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

/**
 * RUTAS PÚBLICAS (No requieren autenticación)
 */

// Registra un nuevo usuario
router.post("/register", sessionsController.register);

// Inicia sesión y genera un token JWT
router.post("/login", sessionsController.login);

/**
 * RUTAS PROTEGIDAS (Requieren autenticación)
 */

// Retorna los datos del usuario logueado
// El middleware requireAuth valida el token JWT
router.get("/current", requireAuth, sessionsController.current);

// POST /api/sessions/logout
// Cierra sesión (con JWT es solo informativo)
router.post("/logout", sessionsController.logout);

module.exports = router;
