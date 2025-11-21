const User = require("../models/user.model");
const Cart = require("../models/cart.model");
const { generateToken } = require("../utils/jwt.utils");
const UserDTO = require("../dto/user.dto");
const ResponseUtil = require("../utils/response.util");
const { ValidationError, ConflictError } = require("../utils/errors.util");

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son obligatorios",
        required: ["first_name", "last_name", "email", "age", "password"],
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "El email ya está registrado",
      });
    }

    const newCart = await Cart.create({ products: [] });

    const newUser = await User.create({
      first_name,
      last_name,
      email,
      age,
      password,
      cart: newCart._id,
      role: role || "user",
    });

    const token = generateToken(newUser);

    return ResponseUtil.successWithCookie(
      res,
      token,
      { user: UserDTO.fromModel(newUser) },
      "Usuario registrado exitosamente"
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      return ResponseUtil.validationError(
        res,
        Object.values(error.errors).map((err) => err.message)
      );
    }

    return ResponseUtil.serverError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email y contraseña son obligatorios",
      });
    }

    const user = await User.findOne({ email }).populate("cart");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    const isPasswordValid = user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    const token = generateToken(user);

    return ResponseUtil.successWithCookie(res, token, { user: UserDTO.fromModel(user) }, "Login exitoso");
  } catch (error) {
    return ResponseUtil.serverError(res, error);
  }
};

/**
 * CURRENT USER
 * GET /api/sessions/current
 * Retorna los datos del usuario logueado (sin información sensible)
 * Esta ruta está protegida por el middleware requireAuth
 */
const current = async (req, res) => {
  try {
    // req.user fue agregado por el middleware requireAuth
    // Ya viene populado desde Passport (incluyendo el cart)

    if (!req.user) {
      return ResponseUtil.unauthorized(res);
    }

    // RESPUESTA EXITOSA con DTO (sin password ni datos sensibles)
    return ResponseUtil.success(res, { user: UserDTO.fromModel(req.user) }, "Usuario autenticado");
  } catch (error) {
    return ResponseUtil.serverError(res, error);
  }
};

/**
 * LOGOUT
 * POST /api/sessions/logout
 * Limpia la cookie de autenticación
 */
const logout = (req, res) => {
  return ResponseUtil.clearAuthCookie(res, "Sesión cerrada exitosamente");
};

module.exports = {
  register,
  login,
  current,
  logout,
};
