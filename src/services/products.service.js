class ProductsService {
  constructor(productsDao) {
    this.productsDao = productsDao;
  }

  async getAllProducts() {
    // Mantener compatibilidad: si el DAO implementa getAllWithOptions la usamos
    if (typeof this.productsDao.getAllWithOptions === "function") {
      // Llamada por defecto sin opciones devuelve todos los productos (limit=10 page=1)
      const result = await this.productsDao.getAllWithOptions();
      // Si el DAO devolvió el objeto paginado, retornarlo tal cual; si no, intentar adaptar
      if (result && result.docs !== undefined) return result;
      return { docs: result };
    }
    return await this.productsDao.getAll();
  }

  async getProductById(id) {
    if (!id) throw new Error("ID requerido");
    return await this.productsDao.getById(id);
  }

  async createProduct(productData) {
    // Alinear la validación del servicio con los campos del modelo. 'description' y 'thumbnails' son opcionales.
    const requiredFields = ["brand", "model", "code", "price", "stock", "category"];
    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(", ")}`);
    }

    return await this.productsDao.create(productData);
  }

  async updateProduct(id, updateData) {
    if (!id) throw new Error("ID requerido");
    const existing = await this.productsDao.getById(id);
    if (!existing) throw new AppError("Producto no encontrado", 404);
    return await this.productsDao.update(id, updateData);
  }

  async deleteProduct(id) {
    if (!id) throw new Error("ID requerido");
    const existing = await this.productsDao.getById(id);
    if (!existing) throw new AppError("Producto no encontrado", 404);
    return await this.productsDao.delete(id);
  }
}

module.exports = ProductsService;
