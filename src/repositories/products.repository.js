/**
 * PRODUCTS REPOSITORY
 * Capa intermedia entre el Service y el DAO
 * Implementa el patrón Repository para abstraer el acceso a datos
 */

class ProductsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  /**
   * Obtener todos los productos con paginación
   * @param {Object} options - Opciones de paginación y filtros
   * @returns {Promise<Object>} Productos paginados
   */
  async getAll(options = {}) {
    return await this.dao.getAll(options);
  }

  /**
   * Obtener producto por ID
   * @param {String} id - ID del producto
   * @returns {Promise<Object|null>} Producto encontrado o null
   */
  async getById(id) {
    return await this.dao.getById(id);
  }

  /**
   * Crear un nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>} Producto creado
   */
  async create(productData) {
    return await this.dao.create(productData);
  }

  /**
   * Actualizar un producto existente
   * @param {String} id - ID del producto
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Producto actualizado
   */
  async update(id, updateData) {
    return await this.dao.update(id, updateData);
  }

  /**
   * Eliminar un producto
   * @param {String} id - ID del producto
   * @returns {Promise<Boolean>} true si se eliminó correctamente
   */
  async delete(id) {
    return await this.dao.delete(id);
  }

  /**
   * Verificar si un producto existe
   * @param {String} id - ID del producto
   * @returns {Promise<Boolean>} true si existe
   */
  async exists(id) {
    const product = await this.dao.getById(id);
    return product !== null;
  }

  /**
   * Actualizar stock de un producto
   * @param {String} id - ID del producto
   * @param {Number} quantity - Nueva cantidad en stock
   * @returns {Promise<Object>} Producto actualizado
   */
  async updateStock(id, quantity) {
    return await this.dao.update(id, { stock: quantity });
  }

  /**
   * Reducir stock de un producto
   * @param {String} id - ID del producto
   * @param {Number} quantity - Cantidad a reducir
   * @returns {Promise<Object>} Producto actualizado
   */
  async reduceStock(id, quantity) {
    const product = await this.dao.getById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }

    const newStock = product.stock - quantity;
    if (newStock < 0) {
      throw new Error("Stock insuficiente");
    }

    return await this.dao.update(id, { stock: newStock });
  }
}

module.exports = ProductsRepository;
