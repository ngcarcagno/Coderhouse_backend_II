/**
 * CLASES DE ERROR PERSONALIZADAS
 * Errores específicos para diferentes casos de uso
 */

/**
 * Error base personalizado
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación (400)
 */
class ValidationError extends AppError {
  constructor(message = "Error de validación", details = null) {
    super(message, 400);
    this.details = details;
  }
}

/**
 * Error de autenticación (401)
 */
class AuthenticationError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401);
  }
}

/**
 * Error de autorización (403)
 */
class AuthorizationError extends AppError {
  constructor(message = "Acceso denegado") {
    super(message, 403);
  }
}

/**
 * Error de recurso no encontrado (404)
 */
class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} no encontrado`, 404);
  }
}

/**
 * Error de conflicto (409)
 * Ejemplo: Email ya registrado
 */
class ConflictError extends AppError {
  constructor(message = "El recurso ya existe") {
    super(message, 409);
  }
}

/**
 * Error de negocio/lógica
 * Ejemplo: Stock insuficiente
 */
class BusinessError extends AppError {
  constructor(message, details = null) {
    super(message, 400);
    this.details = details;
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessError,
};
