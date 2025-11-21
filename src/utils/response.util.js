class ResponseUtil {
  static success(res, data = null, message = "Operación exitosa", statusCode = 200) {
    const response = {
      status: "success",
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  static error(res, message = "Error en la operación", statusCode = 400, details = null) {
    const response = {
      status: "error",
      message,
    };

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  static validationError(res, errors) {
    return res.status(400).json({
      status: "error",
      message: "Error de validación",
      errors: Array.isArray(errors) ? errors : [errors],
    });
  }

  static unauthorized(res, message = "No autorizado - Token inválido o expirado") {
    return res.status(401).json({
      status: "error",
      message,
    });
  }

  static forbidden(res, message = "Acceso denegado - No tiene los permisos necesarios") {
    return res.status(403).json({
      status: "error",
      message,
    });
  }

  static notFound(res, resource = "Recurso") {
    return res.status(404).json({
      status: "error",
      message: `${resource} no encontrado`,
    });
  }

  static serverError(res, error = null) {
    console.error("Error del servidor:", error);

    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
      ...(process.env.NODE_ENV === "development" && error && { details: error.message }),
    });
  }

  static successWithCookie(res, token, data = null, message = "Operación exitosa") {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return this.success(res, data, message);
  }

  static clearAuthCookie(res, message = "Sesión cerrada exitosamente") {
    res.clearCookie("token");
    return this.success(res, null, message);
  }
}

module.exports = ResponseUtil;
