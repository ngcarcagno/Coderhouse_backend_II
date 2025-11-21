/**
 * CARTS REPOSITORY
 * Capa intermedia entre el Service y el DAO
 * Implementa el patrón Repository para abstraer el acceso a datos
 */

class CartsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  /**
   * Crear un nuevo carrito
   * @param {Object} cartData - Datos del carrito (opcional)
   * @returns {Promise<Object>} Carrito creado
   */
  async create(cartData = { products: [] }) {
    return await this.dao.create(cartData);
  }

  /**
   * Obtener carrito por ID
   * @param {String} id - ID del carrito
   * @returns {Promise<Object|null>} Carrito encontrado o null
   */
  async getById(id) {
    return await this.dao.getById(id);
  }

  /**
   * Agregar producto al carrito
   * @param {String} cartId - ID del carrito
   * @param {String} productId - ID del producto
   * @param {Number} quantity - Cantidad a agregar
   * @returns {Promise<Object>} Carrito actualizado
   */
  async addProduct(cartId, productId, quantity = 1) {
    return await this.dao.addProduct(cartId, productId, quantity);
  }

  /**
   * Remover producto del carrito
   * @param {String} cartId - ID del carrito
   * @param {String} productId - ID del producto
   * @returns {Promise<Object>} Carrito actualizado
   */
  async removeProduct(cartId, productId) {
    return await this.dao.removeProduct(cartId, productId);
  }

  /**
   * Actualizar todos los productos del carrito
   * @param {String} cartId - ID del carrito
   * @param {Array} productsArray - Array de productos
   * @returns {Promise<Object>} Carrito actualizado
   */
  async updateProducts(cartId, productsArray) {
    return await this.dao.updateCartProducts(cartId, productsArray);
  }

  /**
   * Actualizar cantidad de un producto en el carrito
   * @param {String} cartId - ID del carrito
   * @param {String} productId - ID del producto
   * @param {Number} quantity - Nueva cantidad
   * @returns {Promise<Object>} Carrito actualizado
   */
  async updateProductQuantity(cartId, productId, quantity) {
    return await this.dao.updateProductQuantity(cartId, productId, quantity);
  }

  /**
   * Limpiar todos los productos del carrito
   * @param {String} cartId - ID del carrito
   * @returns {Promise<Object>} Carrito vacío
   */
  async clearCart(cartId) {
    return await this.dao.clearCart(cartId);
  }

  /**
   * Eliminar carrito
   * @param {String} cartId - ID del carrito
   * @returns {Promise<Boolean>} true si se eliminó
   */
  async delete(cartId) {
    return await this.dao.delete(cartId);
  }

  /**
   * Obtener productos del carrito
   * @param {String} cartId - ID del carrito
   * @returns {Promise<Array>} Array de productos
   */
  async getProducts(cartId) {
    const cart = await this.dao.getById(cartId);
    return cart ? cart.products : [];
  }
}

module.exports = CartsRepository;
