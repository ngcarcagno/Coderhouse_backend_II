// Login functionality
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const submitButton = loginForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // Validación frontend
    if (!email || !password) {
      notify.warning("Por favor completa todos los campos");
      return;
    }

    if (!email.includes("@")) {
      notify.warning("Por favor ingresa un email válido");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Iniciando sesión...";

    try {
      const response = await fetch("/api/sessions/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        notify.success("¡Inicio de sesión exitoso! Redirigiendo...");

        // Redirect after short delay
        setTimeout(() => {
          window.location.href = "/profile";
        }, 1000);
      } else {
        notify.error(data.message || "Error al iniciar sesión");
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    } catch (error) {
      console.error("Login error:", error);
      notify.error("Error de conexión. Intenta nuevamente.");
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});
