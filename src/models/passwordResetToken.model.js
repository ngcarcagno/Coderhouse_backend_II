const mongoose = require("mongoose");

/**
 * PASSWORD RESET TOKEN MODEL
 * Almacena tokens temporales para recuperación de contraseña
 */
const passwordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // Los tokens expiran después de 1 hora
      default: () => new Date(Date.now() + 60 * 60 * 1000),
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para eliminar automáticamente tokens expirados (TTL index)
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Verifica si el token ha expirado
 * @returns {Boolean} true si ha expirado
 */
passwordResetTokenSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

/**
 * Verifica si el token es válido (no usado y no expirado)
 * @returns {Boolean} true si es válido
 */
passwordResetTokenSchema.methods.isValid = function () {
  return !this.used && !this.isExpired();
};

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);
