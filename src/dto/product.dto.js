/**
 * PRODUCT DTO (Data Transfer Object)
 * Clase para transferir datos de productos
 * Formatea y estandariza la información del producto
 */

class ProductDTO {
  constructor(product) {
    this.id = product._id || product.id;
    this.title = product.title;
    this.description = product.description;
    this.code = product.code;
    this.price = product.price;
    this.status = product.status !== undefined ? product.status : true;
    this.stock = product.stock;
    this.category = product.category;
    this.thumbnails = product.thumbnails || [];

    // Información adicional
    this.available = product.stock > 0;
  }

  /**
   * Crear DTO desde un objeto Product de Mongoose
   * @param {Object} product - Documento de producto
   * @returns {ProductDTO} Instancia del DTO
   */
  static fromModel(product) {
    if (!product) return null;
    return new ProductDTO(product);
  }

  /**
   * Crear múltiples DTOs desde un array de productos
   * @param {Array} products - Array de documentos de producto
   * @returns {Array<ProductDTO>} Array de DTOs
   */
  static fromModelArray(products) {
    if (!Array.isArray(products)) return [];
    return products.map((product) => new ProductDTO(product));
  }

  /**
   * Versión resumida del producto (para listados)
   * @returns {Object} Objeto con información resumida
   */
  toSummary() {
    return {
      id: this.id,
      title: this.title,
      price: this.price,
      stock: this.stock,
      available: this.available,
      thumbnail: this.thumbnails[0] || null,
    };
  }
}

module.exports = ProductDTO;
