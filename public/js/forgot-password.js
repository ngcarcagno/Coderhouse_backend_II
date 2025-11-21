// Forgot password functionality
document.addEventListener("DOMContentLoaded", () => {
  const forgotForm = document.getElementById("forgotPasswordForm");
  const submitButton = forgotForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();

    // Validación
    if (!email) {
      notify.warning("Por favor ingresa tu email");
      return;
    }

    if (!email.includes("@")) {
      notify.warning("Por favor ingresa un email válido");
      return;
    }

    // Deshabilitar botón durante la petición
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    try {
      const response = await fetch("/api/password/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        notify.success(
          "Te hemos enviado un email con instrucciones para restablecer tu contraseña. El enlace expirará en 1 hora.",
          8000
        );
        forgotForm.reset();
      } else {
        notify.error(data.message || "Error al enviar el email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      notify.error("Error de conexión. Intenta nuevamente.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
});
