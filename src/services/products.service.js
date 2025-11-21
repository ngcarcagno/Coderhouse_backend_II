/**
 * PRODUCTS SERVICE
 * Capa de lógica de negocio para productos
 * Usa el patrón Repository para abstraer el acceso a datos
 */

class ProductsService {
  constructor(productsDao) {
    // Importar el Repository aquí para evitar dependencias circulares
    const ProductsRepository = require("../repositories/products.repository");
    this.repository = new ProductsRepository(productsDao);
  }

  async getAllProducts() {
    // Mantener compatibilidad: si el DAO implementa getAllWithOptions la usamos
    if (typeof this.repository.dao.getAllWithOptions === "function") {
      // Llamada por defecto sin opciones devuelve todos los productos (limit=10 page=1)
      const result = await this.repository.dao.getAllWithOptions();
      // Si el DAO devolvió el objeto paginado, retornarlo tal cual; si no, intentar adaptar
      if (result && result.docs !== undefined) return result;
      return { docs: result };
    }
    return await this.repository.getAll();
  }

  async getProductById(id) {
    if (!id) throw new Error("ID requerido");
    return await this.repository.getById(id);
  }

  async createProduct(productData) {
    // Alinear la validación del servicio con los campos del modelo. 'description' y 'thumbnails' son opcionales.
    const requiredFields = ["brand", "model", "code", "price", "stock", "category"];
    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(", ")}`);
    }

    return await this.repository.create(productData);
  }

  async updateProduct(id, updateData) {
    if (!id) throw new Error("ID requerido");
    const existing = await this.repository.getById(id);
    if (!existing) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }
    return await this.repository.update(id, updateData);
  }

  async deleteProduct(id) {
    if (!id) throw new Error("ID requerido");
    const existing = await this.repository.getById(id);
    if (!existing) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }
    return await this.repository.delete(id);
  }

  async updateStock(id, quantity) {
    return await this.repository.updateStock(id, quantity);
  }

  async reduceStock(id, quantity) {
    return await this.repository.reduceStock(id, quantity);
  }
}

module.exports = ProductsService;
