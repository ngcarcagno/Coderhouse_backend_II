/**
 * TICKET DTO (Data Transfer Object)
 * Clase para transferir datos de tickets
 * Formatea la información del ticket de compra
 */

class TicketDTO {
  constructor(ticket) {
    this.id = ticket._id || ticket.id;
    this.code = ticket.code;
    this.purchase_datetime = ticket.purchase_datetime;
    this.amount = ticket.amount;
    this.purchaser = ticket.purchaser;
    this.purchaserName = ticket.purchaserDetails?.name || "";
    this.status = ticket.status;
    this.products = this.formatProducts(ticket.products || []);
    this.failedProducts = this.formatFailedProducts(ticket.failedProducts || []);
    this.totalItems = this.calculateTotalItems(ticket.products || []);
  }

  /**
   * Formatea los productos comprados
   * @param {Array} products - Array de productos
   * @returns {Array} Productos formateados
   */
  formatProducts(products) {
    return products.map((item) => {
      // Si el producto está populado
      if (item.product && typeof item.product === "object") {
        return {
          productId: item.product._id || item.product.id,
          title: item.title || item.product.title,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        };
      }

      // Si solo tenemos datos básicos
      return {
        productId: item.product,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      };
    });
  }

  /**
   * Formatea los productos que fallaron
   * @param {Array} failedProducts - Array de productos fallidos
   * @returns {Array} Productos formateados
   */
  formatFailedProducts(failedProducts) {
    return failedProducts.map((item) => ({
      productId: item.product?._id || item.product,
      quantity: item.quantity,
      reason: item.reason,
    }));
  }

  /**
   * Calcula el total de items comprados
   * @param {Array} products - Array de productos
   * @returns {Number} Total de items
   */
  calculateTotalItems(products) {
    return products.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  /**
   * Crear DTO desde un objeto Ticket de Mongoose
   * @param {Object} ticket - Documento de ticket
   * @returns {TicketDTO} Instancia del DTO
   */
  static fromModel(ticket) {
    if (!ticket) return null;
    return new TicketDTO(ticket);
  }

  /**
   * Crear múltiples DTOs desde un array de tickets
   * @param {Array} tickets - Array de documentos de ticket
   * @returns {Array<TicketDTO>} Array de DTOs
   */
  static fromModelArray(tickets) {
    if (!Array.isArray(tickets)) return [];
    return tickets.map((ticket) => new TicketDTO(ticket));
  }

  /**
   * Versión resumida del ticket
   * @returns {Object} Objeto con información resumida
   */
  toSummary() {
    return {
      code: this.code,
      purchase_datetime: this.purchase_datetime,
      amount: this.amount,
      status: this.status,
      totalItems: this.totalItems,
    };
  }
}

module.exports = TicketDTO;
