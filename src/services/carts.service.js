/**
 * CARTS SERVICE
 * Capa de lógica de negocio para carritos
 * Usa el patrón Repository para abstraer el acceso a datos
 */

class CartsService {
  constructor(cartsDao) {
    // Importar el Repository aquí para evitar dependencias circulares
    const CartsRepository = require("../repositories/carts.repository");
    this.repository = new CartsRepository(cartsDao);
  }

  async createCart() {
    const newCart = {
      products: [],
    };
    return await this.repository.create(newCart);
  }

  async getCartProducts(cid) {
    if (!cid) throw new Error("El ID del carrito es requerido");
    const cart = await this.repository.getById(cid);
    if (!cart) {
      throw new Error(`El carrito con ID ${cid} no fue encontrado`);
    }
    return cart.products;
  }

  async getCartById(cid) {
    if (!cid) throw new Error("El ID del carrito es requerido");
    const cart = await this.repository.getById(cid);
    if (!cart) throw new Error(`El carrito con ID ${cid} no fue encontrado`);
    return cart;
  }

  async addProductToCart(cid, pid, quantity = 1) {
    if (!cid) throw new Error("El ID del carrito es requerido");
    if (!pid) throw new Error("El ID del producto es requerido");

    const cart = await this.repository.getById(cid);
    if (!cart) {
      throw new Error(`El carrito con ID ${cid} no fue encontrado`);
    }

    return await this.repository.addProduct(cid, pid, quantity);
  }

  async removeProductFromCart(cid, pid) {
    if (!cid) throw new Error("El ID del carrito es requerido");
    if (!pid) throw new Error("El ID del producto es requerido");

    return await this.repository.removeProduct(cid, pid);
  }

  async replaceCartProducts(cid, productsArray = []) {
    if (!cid) throw new Error("El ID del carrito es requerido");
    return await this.repository.updateProducts(cid, productsArray);
  }

  async updateProductQuantity(cid, pid, quantity) {
    if (!cid) throw new Error("El ID del carrito es requerido");
    if (!pid) throw new Error("El ID del producto es requerido");
    if (quantity === undefined || quantity === null) throw new Error("Quantity es requerido");

    return await this.repository.updateProductQuantity(cid, pid, Number(quantity));
  }

  async clearCart(cid) {
    if (!cid) throw new Error("El ID del carrito es requerido");
    return await this.repository.clearCart(cid);
  }

  async deleteCart(cid) {
    if (!cid) throw new Error("El ID del carrito es requerido");
    return await this.repository.delete(cid);
  }
}

module.exports = CartsService;
