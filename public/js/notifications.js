/**
 * SISTEMA DE NOTIFICACIONES TOAST
 * Muestra mensajes de éxito, error, advertencia e información al usuario
 */

class NotificationSystem {
  constructor() {
    this.container = null;
    this.init();
  }

  /**
   * Inicializar el sistema de notificaciones
   */
  init() {
    // Crear contenedor si no existe
    if (!document.getElementById("notificationsContainer")) {
      this.container = document.createElement("div");
      this.container.id = "notificationsContainer";
      this.container.className = "notifications-container";
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById("notificationsContainer");
    }
  }

  /**
   * Mostrar notificación
   * @param {String} message - Mensaje a mostrar
   * @param {String} type - Tipo: success, error, warning, info
   * @param {Number} duration - Duración en ms (default: 5000)
   */
  show(message, type = "info", duration = 5000) {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;

    // Icono según tipo
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };

    notification.innerHTML = `
      <div class="notification-icon">${icons[type] || icons.info}</div>
      <div class="notification-content">
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" aria-label="Cerrar">✖</button>
    `;

    // Botón de cerrar
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => this.remove(notification));

    // Agregar al contenedor
    this.container.appendChild(notification);

    // Animar entrada
    setTimeout(() => notification.classList.add("notification-show"), 10);

    // Auto-remover después de la duración
    if (duration > 0) {
      setTimeout(() => this.remove(notification), duration);
    }

    return notification;
  }

  /**
   * Remover notificación
   * @param {HTMLElement} notification - Elemento de notificación
   */
  remove(notification) {
    notification.classList.remove("notification-show");
    notification.classList.add("notification-hide");

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Shortcuts para tipos específicos
   */
  success(message, duration = 5000) {
    return this.show(message, "success", duration);
  }

  error(message, duration = 7000) {
    return this.show(message, "error", duration);
  }

  warning(message, duration = 6000) {
    return this.show(message, "warning", duration);
  }

  info(message, duration = 5000) {
    return this.show(message, "info", duration);
  }

  /**
   * Limpiar todas las notificaciones
   */
  clear() {
    const notifications = this.container.querySelectorAll(".notification");
    notifications.forEach((notification) => this.remove(notification));
  }
}

const notify = new NotificationSystem();

// Exportar para uso global
if (typeof window !== "undefined") {
  window.notify = notify;
}
