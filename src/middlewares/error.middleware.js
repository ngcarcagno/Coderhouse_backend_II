/**
 * MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
 * Captura y procesa todos los errores de la aplicación
 */

const { AppError } = require("../utils/errors.util");

/**
 * Middleware para rutas no encontradas (404)
 * Debe colocarse ANTES del errorHandler
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Middleware global de manejo de errores
 * Debe colocarse AL FINAL de todos los middlewares y rutas
 */
const errorHandler = (err, req, res, next) => {
  // Log del error para debugging
  console.error("❌ Error capturado:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
  });

  // Si el error ya tiene statusCode (es un AppError), usarlo
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // Errores de Mongoose (validación, cast, etc.)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Error de validación",
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: `ID inválido: ${err.value}`,
    });
  }

  // Error de duplicado (código 11000 de MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      status: "error",
      message: `El ${field} ya existe`,
    });
  }

  // Error de JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Token inválido",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Token expirado",
    });
  }

  // Respuesta de error genérica
  res.status(statusCode).json({
    status,
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};

/**
 * Wrapper para async functions
 * Evita tener que usar try-catch en cada controlador
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
};
