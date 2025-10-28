// Control de productos en tiempo real (Socket.io)
const socket = io();
(function () {
  window.addEventListener("load", () => {
    // inicializar contador de carrito
    window.initCartCounter("#cartCount");
  });

  let isConnected = false;
  const statusIndicator = document.getElementById("connectionStatus");
  const statusText = document.getElementById("statusText");
  const addProductForm = document.getElementById("addProductForm");
  const productsContainer = document.getElementById("productsContainer");

  socket.on("connect", () => {
    isConnected = true;
    if (statusIndicator) statusIndicator.className = "connected";
    if (statusText) statusText.textContent = "Conectado";
    showMessage("Conectado al servidor", "success");
    socket.emit("requestProducts");
  });

  socket.on("disconnect", () => {
    isConnected = false;
    if (statusIndicator) statusIndicator.className = "disconnected";
    if (statusText) statusText.textContent = "Desconectado";
    showMessage("Conexión perdida", "error");
  });

  socket.on("updateProducts", (products) => updateProductsDisplay(products));

  socket.on("productAdded", (response) => {
    if (response.success) {
      showMessage("Producto agregado", "success");
      addProductForm && addProductForm.reset();
    } else {
      showMessage("Error al agregar producto: " + response.error, "error");
    }
  });

  socket.on("productDeleted", (response) => {
    if (response.success) showMessage("Producto eliminado", "success");
    else showMessage("Error al eliminar producto: " + response.error, "error");
  });

  // Envío del formulario para agregar producto
  addProductForm &&
    addProductForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!isConnected) return showMessage("No hay conexión con el servidor", "error");
      const productData = {
        brand: document.getElementById("brand")?.value,
        model: document.getElementById("model")?.value,
        code: document.getElementById("code")?.value,
        size: document.getElementById("size")?.value,
        description: document.getElementById("description")?.value,
        price: parseFloat(document.getElementById("price")?.value || 0),
        stock: parseInt(document.getElementById("stock")?.value || 0),
        category: document.getElementById("category")?.value,
        status: true,
        thumbnails: [],
      };
      socket.emit("addProduct", productData);
    });

  // Borrar producto (expuesto globalmente para botones inline)
  window.deleteProduct = function (productId) {
    if (!isConnected) return showMessage("No hay conexión con el servidor", "error");
    if (confirm("¿Eliminar este producto?")) socket.emit("deleteProduct", productId);
  };

  function updateProductsDisplay(products) {
    const isEmpty = !products || products.length === 0;
    if (isEmpty) {
      productsContainer.innerHTML = `<div class="empty-state"><p>No se encontraron productos.</p></div>`;
    } else {
      const productsHTML = products
        .map((product) => {
          const id = product._id || product.id || "";
          const brand = product.brand || "";
          const model = product.model || "";
          const size = product.size || "";
          return `
          <div class="product-card new" data-id="${id}">
            <div class="product-header">
              <h3>${brand} ${model}</h3>
              <button class="delete-btn" onclick="deleteProduct('${id}')" title="Eliminar producto">🗑️</button>
            </div>
            <p class="product-description">${product.description || ""}</p>
            <div class="product-details">
              <span class="price">$${product.price || ""}</span>
              <span class="size">Tamaño: ${size}</span>
              <span class="stock">Stock: ${product.stock || 0}</span>
              <span class="category">${product.category || ""}</span>
            </div>
            <div class="product-meta"><small>Código: ${product.code || ""} | Estado: ${
            product.status ? "Activo" : "Inactivo"
          }</small></div>
          </div>`;
        })
        .join("");
      productsContainer.innerHTML = `<div class="products-section"><h2>Productos (${products.length})</h2><div class="products-grid">${productsHTML}</div></div>`;
    }
    setTimeout(() => {
      document.querySelectorAll(".product-card.new").forEach((card) => card.classList.remove("new"));
    }, 500);
  }
})();
