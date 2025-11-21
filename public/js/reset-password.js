// Reset password functionality
document.addEventListener("DOMContentLoaded", () => {
  const resetForm = document.getElementById("resetPasswordForm");
  const submitButton = resetForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  const token = document.getElementById("token").value;

  if (!token) {
    notify.error("Token inválido o no proporcionado");
    submitButton.disabled = true;
    return;
  }

  // Verify token validity on load
  verifyToken();

  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validaciones
    if (!newPassword || !confirmPassword) {
      notify.warning("Por favor completa todos los campos");
      return;
    }

    if (newPassword.length < 6) {
      notify.warning("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.error("Las contraseñas no coinciden");
      return;
    }

    // Deshabilitar botón durante la petición
    submitButton.disabled = true;
    submitButton.textContent = "Restableciendo...";

    try {
      const response = await fetch("/api/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        notify.success("¡Contraseña restablecida exitosamente! Redirigiendo al login...", 3000);

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        notify.error(data.message || "Error al restablecer la contraseña");
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    } catch (error) {
      console.error("Reset password error:", error);
      notify.error("Error de conexión. Intenta nuevamente.");
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

  async function verifyToken() {
    try {
      const response = await fetch(`/api/password/verify-token/${token}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || !data.valid) {
        notify.error("El enlace ha expirado o es inválido. Solicita uno nuevo.", 0);
        submitButton.disabled = true;
      }
    } catch (error) {
      console.error("Token verification error:", error);
      notify.warning("No se pudo verificar el token. Intenta continuar de todas formas.");
    }
  }
});
