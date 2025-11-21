// Register functionality
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const submitButton = registerForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const age = parseInt(document.getElementById("age").value);
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validaciones frontend
    if (!firstName || !lastName || !email || !age || !password || !confirmPassword) {
      notify.warning("Por favor completa todos los campos");
      return;
    }

    if (!email.includes("@")) {
      notify.warning("Por favor ingresa un email válido");
      return;
    }

    if (password.length < 6) {
      notify.warning("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      notify.error("Las contraseñas no coinciden");
      return;
    }

    if (age < 1 || age > 120) {
      notify.warning("Por favor ingresa una edad válida");
      return;
    }

    // Deshabilitar botón durante la petición
    submitButton.disabled = true;
    submitButton.textContent = "Creando cuenta...";

    try {
      const response = await fetch("/api/sessions/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          age,
          password,
        }),
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        notify.success("¡Cuenta creada exitosamente! Redirigiendo al login...");

        // Redirect to login after short delay
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        notify.error(data.message || "Error al crear la cuenta");
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    } catch (error) {
      console.error("Register error:", error);
      notify.error("Error de conexión. Intenta nuevamente.");
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});
