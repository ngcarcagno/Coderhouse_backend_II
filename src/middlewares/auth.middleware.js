const passport = require("passport");

/**
 * MIDDLEWARE: Requiere Autenticación
 * Protege rutas que necesitan que el usuario esté logueado
 * Usa la estrategia JWT de Passport
 */
const requireAuth = (req, res, next) => {
  // passport.authenticate('jwt', { session: false })
  // - 'jwt': Usa la estrategia JWT que configuramos
  // - session: false: No usamos sesiones (usamos tokens stateless)
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    // err: Error del servidor (problemas con BD, etc)
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error en el servidor",
        error: err.message,
      });
    }

    // user: false significa que el token es inválido o el usuario no existe
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "No autorizado - Token inválido o expirado",
        details: info?.message || "Token no válido",
      });
    }

    // Si todo está bien, agregamos el usuario al request
    // Ahora en las rutas protegidas podemos acceder a req.user
    req.user = user;
    next(); // Continuamos al siguiente middleware o controlador
  })(req, res, next);
};

/**
 * MIDDLEWARE: Requiere Rol Admin
 * Protege rutas que solo pueden acceder administradores
 * DEBE usarse DESPUÉS de requireAuth
 */
const requireAdmin = (req, res, next) => {
  // Verificamos que exista req.user (debería existir si pasó por requireAuth)
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

module.exports = {
  requireAuth,
  requireAdmin,
  requireRole,
};
