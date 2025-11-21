/**
 * EMAIL SERVICE
 * Servicio para envío de correos electrónicos usando Nodemailer
 */

const nodemailer = require("nodemailer");
const config = require("../../config/config");

class EmailService {
  constructor() {
    // Configurar el transporter según el ambiente
    this.transporter = this.createTransporter();
  }

  /**
   * Crea el transporter de Nodemailer
   * @returns {Object} Transporter configurado
   */
  createTransporter() {
    // Configuración para Gmail u otro servicio
    if (config.email.service === "gmail") {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    }

    // Configuración para servicios SMTP genéricos
    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure, // true para 465, false para otros puertos
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  /**
   * Envía un email
   * @param {Object} options - Opciones del email
   * @param {String} options.to - Destinatario
   * @param {String} options.subject - Asunto
   * @param {String} options.html - Contenido HTML
   * @param {String} options.text - Contenido texto plano (opcional)
   * @returns {Promise<Object>} Información del envío
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.user}>`,
        to,
        subject,
        html,
        text: text || "", // Fallback a texto plano si no se provee HTML
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado a ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Error enviando email a ${to}:`, error.message);
      throw new Error(`Error al enviar email: ${error.message}`);
    }
  }

  /**
   * Envía email de bienvenida
   * @param {String} email - Email del usuario
   * @param {String} name - Nombre del usuario
   * @returns {Promise<Object>} Información del envío
   */
  async sendWelcomeEmail(email, name) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido a nuestra tienda, ${name}!</h2>
        <p style="color: #666; line-height: 1.6;">
          Gracias por registrarte. Estamos emocionados de tenerte con nosotros.
        </p>
        <p style="color: #666; line-height: 1.6;">
          Ahora puedes explorar nuestros productos y comenzar a comprar.
        </p>
        <p style="color: #666; line-height: 1.6;">
          Si tienes alguna pregunta, no dudes en contactarnos.
        </p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: "¡Bienvenido a nuestra tienda!",
      html,
    });
  }

  /**
   * Envía email de recuperación de contraseña
   * @param {String} email - Email del usuario
   * @param {String} name - Nombre del usuario
   * @param {String} resetToken - Token de recuperación
   * @param {String} resetUrl - URL para resetear contraseña
   * @returns {Promise<Object>} Información del envío
   */
  async sendPasswordResetEmail(email, name, resetToken, resetUrl) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Recuperación de Contraseña</h2>
        <p style="color: #666; line-height: 1.6;">
          Hola ${name},
        </p>
        <p style="color: #666; line-height: 1.6;">
          Recibimos una solicitud para restablecer tu contraseña. 
          Haz clic en el botón de abajo para crear una nueva contraseña:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; 
                    color: white; 
                    padding: 14px 28px; 
                    text-decoration: none; 
                    border-radius: 4px; 
                    display: inline-block;
                    font-weight: bold;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="color: #666; line-height: 1.6;">
          O copia y pega este enlace en tu navegador:
        </p>
        <p style="color: #4CAF50; word-break: break-all;">
          ${resetUrl}
        </p>
        <p style="color: #ff6b6b; line-height: 1.6; font-weight: bold;">
          ⚠️ Este enlace expirará en 1 hora.
        </p>
        <p style="color: #666; line-height: 1.6;">
          Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.
        </p>
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
        <p style="color: #999; font-size: 12px;">
          Token de seguridad: ${resetToken.substring(0, 8)}...
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: "Recuperación de Contraseña",
      html,
    });
  }

  /**
   * Envía email de confirmación de cambio de contraseña
   * @param {String} email - Email del usuario
   * @param {String} name - Nombre del usuario
   * @returns {Promise<Object>} Información del envío
   */
  async sendPasswordChangedEmail(email, name) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Contraseña Actualizada</h2>
        <p style="color: #666; line-height: 1.6;">
          Hola ${name},
        </p>
        <p style="color: #666; line-height: 1.6;">
          Tu contraseña ha sido actualizada exitosamente.
        </p>
        <p style="color: #ff6b6b; line-height: 1.6;">
          Si no realizaste este cambio, contacta a nuestro equipo de soporte inmediatamente.
        </p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: "Contraseña Actualizada",
      html,
    });
  }

  /**
   * Envía email de compra exitosa con ticket
   * @param {String} email - Email del usuario
   * @param {String} name - Nombre del usuario
   * @param {Object} ticket - Información del ticket
   * @returns {Promise<Object>} Información del envío
   */
  async sendPurchaseEmail(email, name, ticket) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4CAF50;">¡Compra Exitosa! 🎉</h2>
        <p style="color: #666; line-height: 1.6;">
          Hola ${name},
        </p>
        <p style="color: #666; line-height: 1.6;">
          Tu compra se ha procesado exitosamente. Aquí están los detalles:
        </p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Código de Compra:</strong> ${ticket.code}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString(
            "es-ES"
          )}</p>
          <p style="margin: 5px 0;"><strong>Total:</strong> $${ticket.amount.toFixed(2)}</p>
        </div>
        <p style="color: #666; line-height: 1.6;">
          Gracias por tu compra. Nos pondremos en contacto contigo pronto con los detalles del envío.
        </p>
        <hr style="border: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: `Confirmación de Compra - ${ticket.code}`,
      html,
    });
  }
}

// Exportar una única instancia (Singleton)
module.exports = new EmailService();
