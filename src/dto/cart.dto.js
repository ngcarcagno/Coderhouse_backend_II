/**
 * CART DTO (Data Transfer Object)
 * Clase para transferir datos de carritos
 * Formatea la información del carrito y sus productos
 */

class CartDTO {
  constructor(cart) {
    this.id = cart._id || cart.id;
    this.products = this.formatProducts(cart.products || []);
    this.totalItems = this.calculateTotalItems(cart.products || []);
    this.totalPrice = this.calculateTotalPrice(cart.products || []);
  }

  /**
   * Formatea los productos del carrito
   * @param {Array} products - Array de productos en el carrito
   * @returns {Array} Productos formateados
   */
  formatProducts(products) {
    return products.map((item) => {
      // Si el producto está populado
      if (item.product && typeof item.product === "object") {
        return {
          productId: item.product._id || item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
          stock: item.product.stock,
          available: item.product.stock >= item.quantity,
        };
      }

      // Si solo tenemos el ID del producto
      return {
        productId: item.product,
        quantity: item.quantity,
      };
    });
  }

  /**
   * Calcula el total de items en el carrito
   * @param {Array} products - Array de productos
   * @returns {Number} Total de items
   */
  calculateTotalItems(products) {
    return products.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  /**
   * Calcula el precio total del carrito
   * @param {Array} products - Array de productos
   * @returns {Number} Precio total
   */
  calculateTotalPrice(products) {
    return products.reduce((total, item) => {
      if (item.product && typeof item.product === "object" && item.product.price) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);
  }

  /**
   * Crear DTO desde un objeto Cart de Mongoose
   * @param {Object} cart - Documento de carrito
   * @returns {CartDTO} Instancia del DTO
   */
  static fromModel(cart) {
    if (!cart) return null;
    return new CartDTO(cart);
  }

  /**
   * Versión resumida del carrito
   * @returns {Object} Objeto con información resumida
   */
  toSummary() {
    return {
      id: this.id,
      totalItems: this.totalItems,
      totalPrice: this.totalPrice,
    };
  }
}

module.exports = CartDTO;
