const mongoose = require("mongoose");

/**
 * TICKET MODEL
 * Representa un ticket de compra generado cuando se finaliza una compra
 */
const ticketSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      // Código único generado automáticamente (ej: TICKET-1732012345678-ABC123)
    },
    purchase_datetime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "El monto no puede ser negativo"],
    },
    purchaser: {
      type: String, // Email del comprador
      required: true,
    },
    // Información adicional del comprador
    purchaserDetails: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    // Productos comprados
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "La cantidad debe ser al menos 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "El precio no puede ser negativo"],
        },
        title: String, // Guardamos el nombre por si el producto se elimina después
      },
    ],
    // Productos que no se pudieron comprar por falta de stock
    failedProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: Number,
        reason: String, // Ej: "Stock insuficiente"
      },
    ],
    status: {
      type: String,
      enum: ["completed", "partial", "failed"],
      default: "completed",
      // completed: Todos los productos se compraron
      // partial: Algunos productos no se compraron
      // failed: Ningún producto se pudo comprar
    },
  },
  {
    timestamps: true, // createdAt y updatedAt
  }
);

// Índice para buscar tickets por comprador
ticketSchema.index({ purchaser: 1 });

// Índice para buscar tickets por usuario
ticketSchema.index({ "purchaserDetails.userId": 1 });

/**
 * Método estático para generar código único de ticket
 * @returns {String} Código único
 */
ticketSchema.statics.generateCode = function () {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TICKET-${timestamp}-${random}`;
};

/**
 * Método de instancia para calcular el total
 * @returns {Number} Total calculado
 */
ticketSchema.methods.calculateTotal = function () {
  return this.products.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

module.exports = mongoose.model("Ticket", ticketSchema);
