/**
 * REPOSITORIES INDEX
 * Exporta todos los Repositories para facilitar la importación
 */

const ProductsRepository = require("./products.repository");
const CartsRepository = require("./carts.repository");
const UsersRepository = require("./users.repository");

module.exports = {
  ProductsRepository,
  CartsRepository,
  UsersRepository,
};
