const { extractDocs } = require("../utils/helpers");

class ViewsController {
  constructor(productsService, cartsService) {
    this.productsService = productsService;
    this.cartsService = cartsService;
  }

  // Renderizar la página de inicio
  renderHome = (req, res) => {
    try {
      res.render("pages/home", { title: "API Products" });
    } catch (error) {
      console.error("Error en la ruta raíz:", error);
      res.status(500).send("Error en el servidor");
    }
  };

  // Renderizar vista de productos en tiempo real
  renderRealtimeProducts = async (req, res) => {
    try {
      // Para la vista en tiempo real queremos TODOS los productos.
      let productsRaw;
      if (
        this.productsService &&
        this.productsService.productsDao &&
        typeof this.productsService.productsDao.getAll === "function"
      ) {
        productsRaw = await this.productsService.productsDao.getAll();
      } else {
        productsRaw = await this.productsService.getAllProducts();
      }

      const products = extractDocs(productsRaw);

      res.render("pages/realtimeproducts", { title: "Products Real Time", products });
    } catch (error) {
      console.error("Error en ruta realtimeproducts:", error);
      res.status(500).send("Error en el servidor");
    }
  };

  // Renderizar vista pública de productos con paginación
  renderProducts = async (req, res) => {
    try {
      const { limit, page, sort, query, category, brand, size, available } = req.query;
      let products;

      if (
        this.productsService &&
        this.productsService.productsDao &&
        typeof this.productsService.productsDao.getAllWithOptions === "function"
      ) {
        products = await this.productsService.productsDao.getAllWithOptions({
          limit,
          page,
          sort,
          query,
          category,
          brand,
          size,
          available,
        });
      } else {
        // fallback to legacy behavior
        products = await this.productsService.getAllProducts();
        if (products && products.docs !== undefined) products = products.docs;
        if (!Array.isArray(products)) products = Array.isArray(products.payload) ? products.payload : [];
        products = { docs: products, limit: Number(limit) || 10, page: Number(page) || 1, totalPages: 1 };
      }

      // Normalizar metadatos para la plantilla
      const meta = {
        totalDocs: 0,
        limit: Number(limit) || (products && products.limit) || 10,
        page: Number(page) || (products && products.page) || 1,
        totalPages: (products && products.totalPages) || 1,
        hasPrevPage: products && products.hasPrevPage,
        hasNextPage: products && products.hasNextPage,
        prevPage: products && products.prevPage,
        nextPage: products && products.nextPage,
      };

      if (products && products.docs !== undefined) {
        meta.totalDocs = products.totalDocs || products.docs.length || 0;
        meta.currentCount = products.docs.length;
        const pg = meta.page;
        const lim = meta.limit;
        meta.showingFrom = meta.totalDocs === 0 ? 0 : (pg - 1) * lim + 1;
        meta.showingTo = Math.min(pg * lim, meta.totalDocs);
      } else if (Array.isArray(products)) {
        meta.totalDocs = products.length;
        meta.currentCount = products.length;
        meta.showingFrom = products.length === 0 ? 0 : 1;
        meta.showingTo = products.length;
        // wrap into docs for template compatibility
        products = { docs: products, limit: meta.limit, page: meta.page, totalPages: meta.totalPages };
      }

      // Construir prevLink / nextLink preservando parámetros de consulta
      const baseUrl = req.path;
      const q = { ...req.query };
      const makeLink = (p) => {
        const qp = new URLSearchParams({ ...q, page: p, limit: meta.limit }).toString();
        return `${baseUrl}?${qp}`;
      };

      const prevLink = meta.hasPrevPage ? makeLink(meta.prevPage) : null;
      const nextLink = meta.hasNextPage ? makeLink(meta.nextPage) : null;

      // También obtener marcas/categorías distintas para poblar filtros desde el servidor
      try {
        const brands =
          this.productsService &&
          this.productsService.productsDao &&
          typeof this.productsService.productsDao.getDistinctValues === "function"
            ? await this.productsService.productsDao.getDistinctValues("brand")
            : [];
        const categories =
          this.productsService &&
          this.productsService.productsDao &&
          typeof this.productsService.productsDao.getDistinctValues === "function"
            ? await this.productsService.productsDao.getDistinctValues("category")
            : [];

        res.render("pages/products", {
          title: "Productos",
          products,
          meta,
          prevLink,
          nextLink,
          showCart: true,
          filters: { brands, categories },
        });
      } catch (ferr) {
        console.warn("No se pudieron obtener valores distintos para filtros", ferr);
        res.render("pages/products", { title: "Productos", products, meta, prevLink, nextLink, showCart: true });
      }
    } catch (error) {
      console.error("Error al renderizar la vista de productos:", error);
      res.status(500).send("Error al cargar productos");
    }
  };

  // Renderizar página de detalle de producto
  renderProductDetail = async (req, res) => {
    try {
      const pid = req.params.pid;
      const product = await this.productsService.getProductById(pid);
      if (!product) return res.status(404).render("pages/404", { title: "Producto no encontrado" });
      res.render("pages/product", { product, title: `${product.brand} ${product.model}` });
    } catch (err) {
      console.error("Error al renderizar detalle de producto:", err);
      res.status(500).send("Error al cargar producto");
    }
  };

  // Renderizar página de carrito
  renderCart = async (req, res) => {
    try {
      const { cid } = req.params;
      const cart = await this.cartsService.getCartById(cid);
      if (!cart) return res.status(404).render("pages/404", { title: "Carrito no encontrado" });
      res.render("pages/cart", { cart, title: "Carrito" });
    } catch (err) {
      console.error("Error rendering cart page:", err);
      res.status(500).send("Error loading cart");
    }
  };

  // Upload de imagen de producto
  uploadProductImage = async (req, res) => {
    try {
      const pid = req.params.id;
      if (!req.file) return res.status(400).send("No se subió archivo");

      // URL pública donde se sirve la imagen
      const publicUrl = `/uploads/${req.file.filename}`;

      // Actualizamos el producto agregando la imagen al array thumbnails
      if (
        this.productsService &&
        this.productsService.productsDao &&
        typeof this.productsService.productsDao.update === "function"
      ) {
        const existing = await this.productsService.productsDao.getById(pid);
        if (!existing) return res.status(404).send("Producto no encontrado");

        const thumbs = Array.isArray(existing.thumbnails) ? existing.thumbnails.slice() : [];
        thumbs.unshift(publicUrl); // añadimos al inicio

        await this.productsService.productsDao.update(pid, { thumbnails: thumbs });
        return res.redirect("/products");
      }

      return res.status(500).send("Manejador de subida no disponible");
    } catch (error) {
      console.error("Error subiendo miniatura:", error);
      return res.status(500).send("Error subiendo archivo");
    }
  };
}

module.exports = ViewsController;
