const express = require("express");
const router = express.Router();

const productsRoutes = require("./products.routes");
const cartsRoutes = require("./carts.routes");
const sessionsRoutes = require("./sessions.routes");

router.use("/products", productsRoutes);
router.use("/carts", cartsRoutes);
router.use("/sessions", sessionsRoutes);

module.exports = router;
