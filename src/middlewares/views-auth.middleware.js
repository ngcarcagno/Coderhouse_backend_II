const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const User = require("../models/user.model");

const loadUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      req.user = null;
      res.clearCookie("token");
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie("token");
    req.user = null;
    next();
  }
};

const requireAuthView = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/login?redirect=" + encodeURIComponent(req.originalUrl));
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      res.clearCookie("token");
      return res.redirect("/login?redirect=" + encodeURIComponent(req.originalUrl));
    }

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie("token");
    return res.redirect("/login?message=session_expired");
  }
};

const requireAdminView = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  if (req.user.role !== "admin") {
    return res.status(403).render("pages/403", {
      title: "Acceso Denegado",
      message: "No tienes permisos de administrador",
    });
  }

  next();
};

const redirectIfAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);

    if (user) {
      // Ya está autenticado, redirigir a home
      return res.redirect("/");
    }

    next();
  } catch (error) {
    // Token inválido, permitir continuar
    res.clearCookie("token");
    next();
  }
};

module.exports = {
  loadUser,
  requireAuthView,
  requireAdminView,
  redirectIfAuth,
};
