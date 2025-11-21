// Profile functionality
document.addEventListener("DOMContentLoaded", () => {
  const profileInfoDiv = document.getElementById("profileInfo");
  const personalInfoDiv = document.getElementById("personalInfo");
  const cartInfoDiv = document.getElementById("cartInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  // Load user profile
  loadProfile();

  // Logout handler
  logoutBtn.addEventListener("click", async () => {
    if (confirm("¿Seguro que quieres cerrar sesión?")) {
      try {
        await fetch("/api/sessions/logout", {
          method: "POST",
          credentials: "include",
        });
        notify.success("Sesión cerrada exitosamente");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } catch (error) {
        console.error("Logout error:", error);
        // Redirigir de todas formas
        window.location.href = "/login";
      }
    }
  });

  async function loadProfile() {
    try {
      profileInfoDiv.innerHTML = "<p>Cargando perfil...</p>";

      const response = await fetch("/api/sessions/current", {
        credentials: "include",
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.status === 401) {
        // No autenticado
        notify.error("Sesión expirada. Por favor inicia sesión nuevamente.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }

      const data = await response.json();
      console.log("Data recibida:", data);

      // El usuario está en data.data.user, no en data.user
      const user = data.data?.user || data.user;
      console.log("Usuario extraído:", user);

      if (response.ok && user) {
        displayProfile(user);
      } else {
        console.error("Problema: response.ok =", response.ok, "user =", user);
        console.error("Data completa:", JSON.stringify(data, null, 2));
        notify.error("Error al cargar perfil");
        profileInfoDiv.innerHTML = '<p class="error">Error al cargar el perfil</p>';
      }
    } catch (error) {
      console.error("Profile error:", error);
      notify.error("Error de conexión al cargar el perfil");
      profileInfoDiv.innerHTML = '<p class="error">Error de conexión</p>';
    }
  }

  function displayProfile(user) {
    // Profile header
    profileInfoDiv.innerHTML = `
      <h2>${user.first_name} ${user.last_name}</h2>
      <p class="user-role">${user.role === "admin" ? "👑 Administrador" : "👤 Usuario"}</p>
    `;

    // Personal info
    personalInfoDiv.innerHTML = `
      <div class="info-item">
        <span class="info-label">Nombre:</span>
        <span class="info-value">${user.first_name} ${user.last_name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email:</span>
        <span class="info-value">${user.email}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Edad:</span>
        <span class="info-value">${user.age} años</span>
      </div>
      <div class="info-item">
        <span class="info-label">Rol:</span>
        <span class="info-value">${user.role}</span>
      </div>
    `;

    // Cart info
    if (user.cart) {
      cartInfoDiv.innerHTML = `
        <p>ID del carrito: <code>${user.cart}</code></p>
        <a href="/carts/${user.cart}" class="btn btn-primary" style="margin-top: 12px;">
          🛒 Ver Mi Carrito
        </a>
      `;
    } else {
      cartInfoDiv.innerHTML = `<p class="text-muted">No tienes un carrito asignado</p>`;
    }
  }
});
