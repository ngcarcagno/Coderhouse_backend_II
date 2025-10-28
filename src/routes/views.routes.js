const express = require("express");
const router = express.Router();

// Importar middlewares
const upload = require("../middlewares/upload.middleware");

// Importar DAOs y servicios
const ProductsDaoDB = require("../dao/products.dao.db");
const CartsDaoDB = require("../dao/carts.dao.db");
const ProductsService = require("../services/products.service");
const CartsService = require("../services/carts.service");

// Importar controlador
const ViewsController = require("../controllers/views.controller");

// Instanciar servicios
const productsDao = new ProductsDaoDB();
const cartsDao = new CartsDaoDB();
const productsService = new ProductsService(productsDao);
const cartsService = new CartsService(cartsDao);

// Instanciar controlador
const viewsController = new ViewsController(productsService, cartsService);

// Definir rutas
router.get("/", viewsController.renderHome);
router.get("/realtimeproducts", viewsController.renderRealtimeProducts);
router.get("/products", viewsController.renderProducts);
router.get("/products/:pid", viewsController.renderProductDetail);
router.get("/carts/:cid", viewsController.renderCart);
router.post("/products/:id/upload", upload.single("thumbnail"), viewsController.uploadProductImage);

module.exports = router;
