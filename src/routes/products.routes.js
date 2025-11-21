const express = require("express");
const router = express.Router();
const config = require("../../config/config");

const ProductsService = require("../services/products.service");
const ProductsController = require("../controllers/products.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

// Usar implementación MongoDB por defecto
const ProductsDaoDB = require("../dao/products.dao.db");
const productsDao = new ProductsDaoDB();
// const ProductsDao = require("../dao/products.dao.local");
// const productsDao = new ProductsDao(config.getFilePath("products.json"));

const productsService = new ProductsService(productsDao);
const productsController = new ProductsController(productsService);

// RUTAS PÚBLICAS - Solo lectura
router.get("/", productsController.getProducts);
router.get("/:pid", productsController.getProductById);

// RUTAS PROTEGIDAS - Solo admin puede crear, actualizar y eliminar
router.post("/", requireAuth, requireAdmin, productsController.createProduct);
router.put("/:pid", requireAuth, requireAdmin, productsController.updateProduct);
router.delete("/:pid", requireAuth, requireAdmin, productsController.deleteProduct);

module.exports = router;
