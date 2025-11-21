const express = require("express");
const router = express.Router();
const config = require("../../config/config");

const CartsService = require("../services/carts.service");
const CartsController = require("../controllers/carts.controller");
const ticketsController = require("../controllers/tickets.controller");
const { requireAuth, requireCartOwner } = require("../middlewares/auth.middleware");

// Usar implementación MongoDB por defecto
const CartsDaoDB = require("../dao/carts.dao.db");
const cartsDao = new CartsDaoDB();
// const CartsDao = require("../dao/carts.dao.local");
// const cartsDao = new CartsDao(config.getFilePath("carts.json"));

const cartsService = new CartsService(cartsDao);
const cartsController = new CartsController(cartsService);

// RUTAS PÚBLICAS
router.post("/", cartsController.createCart);
router.get("/:cid", cartsController.getCartProducts);

// RUTAS PROTEGIDAS - Solo el dueño del carrito o admin
router.post("/:cid/product/:pid", requireAuth, requireCartOwner, cartsController.addProductToCart);
router.delete("/:cid/products/:pid", requireAuth, requireCartOwner, cartsController.removeProductFromCart);
router.put("/:cid", requireAuth, requireCartOwner, cartsController.replaceCartProducts);
router.put("/:cid/products/:pid", requireAuth, requireCartOwner, cartsController.updateProductQuantity);
router.delete("/:cid", requireAuth, requireCartOwner, cartsController.clearCart);

// Purchase Route - Finalizar compra (solo el dueño del carrito)
router.post("/:cid/purchase", requireAuth, requireCartOwner, ticketsController.purchaseCart);

module.exports = router;
