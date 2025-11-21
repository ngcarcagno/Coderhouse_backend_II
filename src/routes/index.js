const express = require("express");
const router = express.Router();

const productsRoutes = require("./products.routes");
const cartsRoutes = require("./carts.routes");
const sessionsRoutes = require("./sessions.routes");
const passwordRoutes = require("./password.routes");
const ticketsRoutes = require("./tickets.routes");

router.use("/products", productsRoutes);
router.use("/carts", cartsRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/password", passwordRoutes);
router.use("/tickets", ticketsRoutes);

module.exports = router;
