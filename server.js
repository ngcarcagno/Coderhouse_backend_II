const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server);

const config = require("./config/config");
const { paths } = config;

const handlebars = require("express-handlebars");
const mongoose = require("mongoose");

// Importar e instanciar servicios para websockets (usar DAO Mongo)
const ProductsDaoDB = require("./src/dao/products.dao.db");
const ProductsService = require("./src/services/products.service");
const { extractDocs } = require("./src/utils/helpers");

// Conectar a MongoDB antes de instanciar DAOs que lo usen
if (config.database && config.database.uri) {
  mongoose
    .connect(config.database.uri, {
      maxPoolSize: config.database.maxPoolSize || 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: config.database.socketTimeout || 45000,
    })
    .then(() => console.log("Conexión a MongoDB exitosa"))
    .catch((error) => console.error("Error de conexión a MongoDB:", error.message || error));
} else {
  console.warn(
    "Aviso: config.database.uri no está definido. La app seguirá funcionando con DAOs locales si están habilitados."
  );
}

// Instanciar servicios para websockets
const productsDao = new ProductsDaoDB();
const productsService = new ProductsService(productsDao);

//! ---------- HANDLEBARS --------------
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    // Register small helpers used by the templates
    helpers: {
      // concat helper: joins all provided arguments into a single string
      concat: function (...args) {
        // Handlebars passes an options object as the last arg; remove it
        if (args.length && typeof args[args.length - 1] === "object") args.pop();
        return args.join("");
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", paths.views);

//! --------- MIDDLEWARES --------------
app.use(express.json()); // Middleware to parse JSON
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
}); // Middleware for CORS

//! --------- PASSPORT --------------
const passport = require("./config/passport.config");
app.use(passport.initialize());

//* Static
app.use("/static", express.static(paths.public));
app.use("/uploads", express.static(paths.upload));

// Hacer io disponible globalmente para los controladores
app.set("io", io);

// Routes API
const routes = require("./src/routes/index");
app.use("/api", routes);

// Routes Views
const viewsRoutes = require("./src/routes/views.routes");
app.use("/", viewsRoutes);

//* Middleware para 404 - usando Handlebars
app.use((req, res, next) => {
  res.status(404).render("pages/404", { title: "404 - No encontrado" });
});

//* Middleware de manejo de errores - para capturar errores no manejados
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Error interno en el servidor",
  });
});

// Configuración de Socket.io
io.on("connection", (socket) => {
  console.log("🔌 Usuario conectado:", socket.id);

  // Enviar lista de productos al conectarse
  socket.on("requestProducts", async () => {
    try {
      const raw =
        productsService && productsService.productsDao && typeof productsService.productsDao.getAll === "function"
          ? await productsService.productsDao.getAll()
          : await productsService.getAllProducts();
      socket.emit("updateProducts", extractDocs(raw));
    } catch (error) {
      socket.emit("error", "Error al obtener productos");
    }
  });

  // Agregar producto
  socket.on("addProduct", async (productData) => {
    try {
      const newProduct = await productsService.createProduct(productData);
      const raw =
        productsService && productsService.productsDao && typeof productsService.productsDao.getAll === "function"
          ? await productsService.productsDao.getAll()
          : await productsService.getAllProducts();
      io.emit("updateProducts", extractDocs(raw));
      socket.emit("productAdded", { success: true, product: newProduct });
    } catch (error) {
      socket.emit("productAdded", { success: false, error: error.message });
    }
  });

  // Eliminar producto
  socket.on("deleteProduct", async (productId) => {
    try {
      await productsService.deleteProduct(productId);
      const raw =
        productsService && productsService.productsDao && typeof productsService.productsDao.getAll === "function"
          ? await productsService.productsDao.getAll()
          : await productsService.getAllProducts();
      io.emit("updateProducts", extractDocs(raw));
      socket.emit("productDeleted", { success: true, id: productId });
    } catch (error) {
      socket.emit("productDeleted", { success: false, error: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Usuario desconectado:", socket.id);
  });
});

server.listen(config.PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${config.PORT}`);
});

// Exportar el server para que pueda ser iniciado desde index.js
module.exports = server;
