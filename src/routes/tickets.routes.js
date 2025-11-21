/**
 * TICKETS ROUTES
 * Rutas para gestión de tickets de compra
 */

const express = require("express");
const router = express.Router();
const ticketsController = require("../controllers/tickets.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

/**
 * RUTAS PROTEGIDAS (Requieren autenticación)
 */

// GET /api/tickets/my-tickets
// Obtiene todos los tickets del usuario autenticado
router.get("/my-tickets", requireAuth, ticketsController.getMyTickets);

/**
 * RUTAS ADMIN (Requieren autenticación y rol admin)
 */

// GET /api/tickets
// Obtiene todos los tickets (solo admin)
router.get("/", requireAuth, requireAdmin, ticketsController.getAllTickets);

// GET /api/tickets/id/:id
// Obtiene un ticket por ID (solo admin)
router.get("/id/:id", requireAuth, requireAdmin, ticketsController.getTicketById);

// GET /api/tickets/:code
// Obtiene un ticket por su código (debe ir al final)
router.get("/:code", requireAuth, ticketsController.getTicketByCode);

module.exports = router;
