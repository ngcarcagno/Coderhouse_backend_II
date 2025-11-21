const passport = require("passport");

const requireAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error en el servidor",
        error: err.message,
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "No autorizado - Token inválido o expirado",
        details: info?.message || "Token no válido",
      });
    }

    req.user = user;
    next();
  })(req, res, next);
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "No autorizado - Debe estar autenticado",
    });
  }

  // Verificamos que el rol sea 'admin'
  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Acceso denegado - Requiere permisos de administrador",
    });
  }

  next(); // Si es admin, continúa
};

/**
 * MIDDLEWARE: Requiere Rol Específico
 * Protege rutas que requieren un rol particular
 * @param {String[]} roles - Array de roles permitidos
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "No autorizado - Debe estar autenticado",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: `Acceso denegado - Requiere uno de estos roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * MIDDLEWARE: Requiere ser dueño del carrito
 * Verifica que el usuario sea el dueño del carrito o admin
 */
const requireCartOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "No autorizado - Debe estar autenticado",
    });
  }

  const { cid } = req.params;

  // Admin puede acceder a cualquier carrito
  if (req.user.role === "admin") {
    return next();
  }

  // Verificar que el carrito pertenezca al usuario
  if (!req.user.cart || req.user.cart.toString() !== cid) {
    return res.status(403).json({
      status: "error",
      message: "No puede modificar un carrito que no le pertenece",
    });
  }

  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireRole,
  requireCartOwner,
};
