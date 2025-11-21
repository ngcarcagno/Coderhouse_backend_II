// Tickets/purchases functionality
document.addEventListener("DOMContentLoaded", () => {
  const ticketsListDiv = document.getElementById("ticketsList");
  const emptyState = document.getElementById("emptyState");

  // Load tickets
  loadTickets();

  async function loadTickets() {
    try {
      ticketsListDiv.innerHTML = '<p style="text-align: center; padding: 20px;">Cargando compras...</p>';

      const response = await fetch("/api/tickets/my-tickets", {
        credentials: "include",
      });

      if (response.status === 401) {
        notify.error("Sesión expirada. Por favor inicia sesión nuevamente.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }

      const data = await response.json();

      if (response.ok && data.data && data.data.tickets && data.data.tickets.length > 0) {
        displayTickets(data.data.tickets);
        emptyState.style.display = "none";
      } else {
        ticketsListDiv.innerHTML = "";
        emptyState.style.display = "block";
      }
    } catch (error) {
      console.error("Tickets error:", error);
      notify.error("Error al cargar compras");
      ticketsListDiv.innerHTML = '<p class="error" style="text-align: center;">Error al cargar las compras</p>';
    }
  }

  function displayTickets(tickets) {
    ticketsListDiv.innerHTML = tickets
      .map(
        (ticket) => `
      <div class="ticket-card">
        <div class="ticket-header">
          <div>
            <h3>Compra #${ticket.code}</h3>
            <p class="ticket-date">${formatDate(ticket.purchase_datetime)}</p>
          </div>
          <div class="ticket-status ${ticket.status}">
            ${getStatusBadge(ticket.status)}
          </div>
        </div>
        
        <div class="ticket-body">
          <div class="ticket-info">
            <p><strong>Comprador:</strong> ${ticket.purchaser}</p>
            <p><strong>Total:</strong> $${ticket.amount.toFixed(2)}</p>
          </div>
          
          <div class="ticket-products">
            <h4>Productos (${ticket.products.length})</h4>
            <ul>
              ${ticket.products
                .map(
                  (item) => `
                <li>
                  ${item.title || "Producto"} - 
                  Cantidad: ${item.quantity} - 
                  $${item.price.toFixed(2)} c/u
                </li>
              `
                )
                .join("")}
            </ul>
          </div>
          
          ${
            ticket.failedProducts && ticket.failedProducts.length > 0
              ? `
            <div class="ticket-failed">
              <h4>⚠️ Productos no disponibles (${ticket.failedProducts.length})</h4>
              <ul>
                ${ticket.failedProducts
                  .map(
                    (item) => `
                  <li>${item.reason || "Stock insuficiente"} - Cantidad solicitada: ${item.quantity}</li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusBadge(status) {
    const badges = {
      completed: "✅ Completada",
      partial: "⚠️ Parcial",
      failed: "❌ Fallida",
    };
    return badges[status] || status;
  }
});
