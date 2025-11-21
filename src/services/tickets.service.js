/**
 * TICKETS SERVICE
 * Servicio para gestión de tickets de compra
 */

const Ticket = require("../models/ticket.model");
const Product = require("../models/product.model");
const Cart = require("../models/cart.model");
const emailService = require("./email.service");

class TicketsService {
  /**
   * Procesa la compra del carrito de un usuario
   * Verifica stock, genera ticket, actualiza inventario
   * @param {Object} user - Usuario que realiza la compra
   * @param {String} cartId - ID del carrito
   * @returns {Promise<Object>} Resultado de la compra con ticket
   */
  async processPurchase(user, cartId) {
    try {
      // 1. Obtener el carrito con productos populados
      const cart = await Cart.findById(cartId).populate("products.product");

      if (!cart || !cart.products || cart.products.length === 0) {
        throw new Error("El carrito está vacío");
      }

      // 2. Verificar stock y separar productos disponibles de no disponibles
      const productsToProcess = [];
      const failedProducts = [];
      let totalAmount = 0;

      for (const item of cart.products) {
        const product = item.product;

        // Validar que el producto exista
        if (!product) {
          failedProducts.push({
            product: item.product,
            quantity: item.quantity,
            reason: "Producto no encontrado",
          });
          continue;
        }

        // Verificar stock disponible
        if (product.stock >= item.quantity) {
          // Hay stock suficiente
          productsToProcess.push({
            product: product._id,
            productData: product,
            quantity: item.quantity,
            price: product.price,
            title: product.title,
          });
          totalAmount += product.price * item.quantity;
        } else if (product.stock > 0) {
          // Stock parcial
          productsToProcess.push({
            product: product._id,
            productData: product,
            quantity: product.stock, // Solo lo que hay disponible
            price: product.price,
            title: product.title,
          });
          totalAmount += product.price * product.stock;

          // Registrar la cantidad que no se pudo comprar
          failedProducts.push({
            product: product._id,
            quantity: item.quantity - product.stock,
            reason: `Stock insuficiente (solo ${product.stock} disponibles)`,
          });
        } else {
          // Sin stock
          failedProducts.push({
            product: product._id,
            quantity: item.quantity,
            reason: "Sin stock disponible",
          });
        }
      }

      // 3. Validar que al menos un producto se pueda comprar
      if (productsToProcess.length === 0) {
        throw new Error("No hay productos disponibles para comprar");
      }

      // 4. Generar código único de ticket
      const ticketCode = Ticket.generateCode();

      // 5. Crear el ticket
      const ticket = await Ticket.create({
        code: ticketCode,
        purchase_datetime: new Date(),
        amount: totalAmount,
        purchaser: user.email,
        purchaserDetails: {
          userId: user._id,
          name: `${user.first_name} ${user.last_name}`,
        },
        products: productsToProcess.map((p) => ({
          product: p.product,
          quantity: p.quantity,
          price: p.price,
          title: p.title,
        })),
        failedProducts: failedProducts,
        status: failedProducts.length > 0 ? "partial" : "completed",
      });

      // 6. Actualizar stock de productos
      for (const item of productsToProcess) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // 7. Limpiar el carrito de productos comprados
      const remainingProducts = cart.products.filter((item) => {
        return failedProducts.some((failed) => failed.product.toString() === item.product._id.toString());
      });

      cart.products = remainingProducts;
      await cart.save();

      // 8. Enviar email de confirmación
      try {
        await emailService.sendPurchaseEmail(user.email, user.first_name, ticket);
      } catch (emailError) {
        console.error("Error enviando email de compra:", emailError);
        // No fallar la compra si falla el email
      }

      // 9. Retornar resultado
      return {
        success: true,
        ticket,
        failedProducts: failedProducts.length > 0 ? failedProducts : null,
        message:
          failedProducts.length > 0
            ? "Compra parcial: algunos productos no tenían stock suficiente"
            : "Compra completada exitosamente",
      };
    } catch (error) {
      console.error("Error procesando compra:", error);
      throw error;
    }
  }

  /**
   * Obtener ticket por código
   * @param {String} code - Código del ticket
   * @returns {Promise<Object>} Ticket encontrado
   */
  async getTicketByCode(code) {
    const ticket = await Ticket.findOne({ code }).populate("products.product");
    if (!ticket) {
      throw new Error("Ticket no encontrado");
    }
    return ticket;
  }

  /**
   * Obtener tickets de un usuario
   * @param {String} userId - ID del usuario
   * @returns {Promise<Array>} Lista de tickets
   */
  async getUserTickets(userId) {
    const tickets = await Ticket.find({ "purchaserDetails.userId": userId })
      .populate("products.product")
      .sort({ purchase_datetime: -1 }); // Más recientes primero

    return tickets;
  }

  /**
   * Obtener todos los tickets (solo admin)
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Array>} Lista de tickets
   */
  async getAllTickets(options = {}) {
    const { limit = 50, page = 1, status } = options;

    const query = status ? { status } : {};

    const tickets = await Ticket.find(query)
      .populate("products.product")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ purchase_datetime: -1 });

    const total = await Ticket.countDocuments(query);

    return {
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener ticket por ID
   * @param {String} ticketId - ID del ticket
   * @returns {Promise<Object>} Ticket encontrado
   */
  async getTicketById(ticketId) {
    const ticket = await Ticket.findById(ticketId).populate("products.product");
    if (!ticket) {
      throw new Error("Ticket no encontrado");
    }
    return ticket;
  }
}

module.exports = TicketsService;
