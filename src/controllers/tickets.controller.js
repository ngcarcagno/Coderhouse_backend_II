/**
 * TICKETS CONTROLLER
 * Controlador para gestión de tickets de compra
 */

const TicketsService = require("../services/tickets.service");
const TicketDTO = require("../dto/ticket.dto");

const ticketsService = new TicketsService();

/**
 * FINALIZAR COMPRA
 * POST /api/carts/:cid/purchase
 * Procesa la compra del carrito y genera un ticket
 */
const purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const user = req.user; // Viene del middleware requireAuth

    // Validar que el usuario esté autenticado
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Debe estar autenticado para realizar una compra",
      });
    }

    // Validar que el carrito pertenezca al usuario
    if (user.cart && user.cart.toString() !== cid) {
      return res.status(403).json({
        status: "error",
        message: "No puede comprar un carrito que no le pertenece",
      });
    }

    // Procesar la compra
    const result = await ticketsService.processPurchase(user, cid);

    // Respuesta exitosa
    res.status(200).json({
      status: "success",
      message: result.message,
      data: {
        ticket: TicketDTO.fromModel(result.ticket),
        failedProducts: result.failedProducts,
      },
    });
  } catch (error) {
    console.error("Error en purchaseCart:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error al procesar la compra",
    });
  }
};

/**
 * OBTENER TICKET POR CÓDIGO
 * GET /api/tickets/:code
 * Obtiene un ticket específico por su código
 */
const getTicketByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const user = req.user;

    const ticket = await ticketsService.getTicketByCode(code);

    // Validar que el usuario sea el dueño del ticket o admin
    if (user.role !== "admin" && ticket.purchaserDetails.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "No tiene permiso para ver este ticket",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        ticket: TicketDTO.fromModel(ticket),
      },
    });
  } catch (error) {
    console.error("Error en getTicketByCode:", error);
    res.status(404).json({
      status: "error",
      message: error.message || "Ticket no encontrado",
    });
  }
};

/**
 * OBTENER MIS TICKETS
 * GET /api/tickets/my-tickets
 * Obtiene todos los tickets del usuario autenticado
 */
const getMyTickets = async (req, res) => {
  try {
    const user = req.user;

    const tickets = await ticketsService.getUserTickets(user._id);

    res.status(200).json({
      status: "success",
      data: {
        tickets: TicketDTO.fromModelArray(tickets),
        total: tickets.length,
      },
    });
  } catch (error) {
    console.error("Error en getMyTickets:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error al obtener tickets",
    });
  }
};

/**
 * OBTENER TODOS LOS TICKETS (ADMIN)
 * GET /api/tickets
 * Obtiene todos los tickets del sistema (solo admin)
 */
const getAllTickets = async (req, res) => {
  try {
    const { limit, page, status } = req.query;

    const result = await ticketsService.getAllTickets({
      limit: parseInt(limit) || 50,
      page: parseInt(page) || 1,
      status,
    });

    res.status(200).json({
      status: "success",
      data: {
        tickets: TicketDTO.fromModelArray(result.tickets),
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Error en getAllTickets:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error al obtener tickets",
    });
  }
};

/**
 * OBTENER TICKET POR ID (ADMIN)
 * GET /api/tickets/id/:id
 * Obtiene un ticket específico por su ID (solo admin)
 */
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await ticketsService.getTicketById(id);

    res.status(200).json({
      status: "success",
      data: {
        ticket: TicketDTO.fromModel(ticket),
      },
    });
  } catch (error) {
    console.error("Error en getTicketById:", error);
    res.status(404).json({
      status: "error",
      message: error.message || "Ticket no encontrado",
    });
  }
};

module.exports = {
  purchaseCart,
  getTicketByCode,
  getMyTickets,
  getAllTickets,
  getTicketById,
};
