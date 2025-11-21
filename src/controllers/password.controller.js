/**
 * PASSWORD RESET CONTROLLER
 * Controlador para gestión de recuperación de contraseña
 */

const { v4: uuidv4 } = require("uuid");
const User = require("../models/user.model");
const PasswordResetToken = require("../models/passwordResetToken.model");
const emailService = require("../services/email.service");
const config = require("../../config/config");

/**
 * SOLICITAR RECUPERACIÓN DE CONTRASEÑA
 * POST /api/password/request-reset
 * Genera un token y envía email con link de recuperación
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar que venga el email
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "El email es requerido",
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email });

    // Por seguridad, siempre respondemos lo mismo exista o no el usuario
    // Esto evita que se pueda saber qué emails están registrados
    if (!user) {
      return res.status(200).json({
        status: "success",
        message: "Si el email existe, recibirás un correo con las instrucciones",
      });
    }

    // Invalidar tokens anteriores del usuario
    await PasswordResetToken.updateMany({ userId: user._id, used: false }, { used: true });

    // Generar nuevo token único
    const resetToken = uuidv4();

    // Crear registro del token en la BD
    await PasswordResetToken.create({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    });

    // Construir URL de reset
    const resetUrl = `${config.frontend.url}${config.frontend.resetPasswordPath}?token=${resetToken}`;

    // Enviar email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.first_name, resetToken, resetUrl);
    } catch (emailError) {
      console.error("Error enviando email:", emailError);
      // Continuar aunque falle el email (el token ya está creado)
    }

    res.status(200).json({
      status: "success",
      message: "Si el email existe, recibirás un correo con las instrucciones",
    });
  } catch (error) {
    console.error("Error en requestPasswordReset:", error);
    res.status(500).json({
      status: "error",
      message: "Error al procesar la solicitud",
      error: error.message,
    });
  }
};

/**
 * VERIFICAR TOKEN DE RECUPERACIÓN
 * GET /api/password/verify-token/:token
 * Verifica si un token es válido
 */
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Token requerido",
      });
    }

    // Buscar token
    const resetToken = await PasswordResetToken.findOne({ token });

    if (!resetToken) {
      return res.status(400).json({
        status: "error",
        message: "Token inválido",
      });
    }

    // Verificar si el token es válido
    if (!resetToken.isValid()) {
      return res.status(400).json({
        status: "error",
        message: resetToken.isExpired() ? "Token expirado" : "Token ya utilizado",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Token válido",
      data: {
        valid: true,
      },
    });
  } catch (error) {
    console.error("Error en verifyResetToken:", error);
    res.status(500).json({
      status: "error",
      message: "Error al verificar el token",
      error: error.message,
    });
  }
};

/**
 * RESTABLECER CONTRASEÑA
 * POST /api/password/reset
 * Cambia la contraseña usando el token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validaciones
    if (!token || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Token y nueva contraseña son requeridos",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Buscar token
    const resetToken = await PasswordResetToken.findOne({ token });

    if (!resetToken) {
      return res.status(400).json({
        status: "error",
        message: "Token inválido",
      });
    }

    // Verificar validez del token
    if (!resetToken.isValid()) {
      return res.status(400).json({
        status: "error",
        message: resetToken.isExpired() ? "Token expirado" : "Token ya utilizado",
      });
    }

    // Buscar usuario
    const user = await User.findById(resetToken.userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // VALIDAR que la nueva contraseña no sea igual a la actual
    if (user.comparePassword(newPassword)) {
      return res.status(400).json({
        status: "error",
        message: "La nueva contraseña no puede ser igual a la actual",
      });
    }

    // VALIDAR que no sea igual a la contraseña anterior
    if (user.isSameAsPreviousPassword(newPassword)) {
      return res.status(400).json({
        status: "error",
        message: "La nueva contraseña no puede ser igual a la contraseña anterior",
      });
    }

    // Guardar el hash actual como contraseña anterior
    user._previousPasswordHash = user.password;

    // Actualizar contraseña (el pre-save hook hasheará automáticamente)
    user.password = newPassword;
    await user.save();

    // Marcar token como usado
    resetToken.used = true;
    await resetToken.save();

    // Enviar email de confirmación
    try {
      await emailService.sendPasswordChangedEmail(user.email, user.first_name);
    } catch (emailError) {
      console.error("Error enviando email de confirmación:", emailError);
    }

    res.status(200).json({
      status: "success",
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({
      status: "error",
      message: "Error al restablecer la contraseña",
      error: error.message,
    });
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
};
