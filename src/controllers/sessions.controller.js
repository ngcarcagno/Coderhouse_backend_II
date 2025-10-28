const User = require("../models/user.model");
const Cart = require("../models/cart.model");
const { generateToken } = require("../utils/jwt.utils");

/**
 * REGISTRO DE USUARIO
 * POST /api/sessions/register
 * Crea un nuevo usuario en la BD
 */
const register = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;

    // VALIDACIÓN: Verificar que vengan todos los campos requeridos
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son obligatorios",
        required: ["first_name", "last_name", "email", "age", "password"],
      });
    }

    // VALIDACIÓN: Verificar que el email no esté registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "El email ya está registrado",
      });
    }

    // Crear un carrito vacío para el nuevo usuario
    const newCart = await Cart.create({ products: [] });

    // CREAR USUARIO
    // La contraseña se hasheará automáticamente por el pre-save hook
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      age,
      password,
      cart: newCart._id,
      role: role || "user", // Si no se especifica rol, será 'user'
    });

    // GENERAR TOKEN JWT
    const token = generateToken(newUser);

    // RESPUESTA EXITOSA
    // Usamos toJSON() para no enviar el password
    res.status(201).json({
      status: "success",
      message: "Usuario registrado exitosamente",
      data: {
        user: newUser.toJSON(),
        token,
      },
    });
  } catch (error) {
    // Manejo de errores de validación de Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        message: "Error de validación",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    // Error genérico del servidor
    res.status(500).json({
      status: "error",
      message: "Error al registrar usuario",
      error: error.message,
    });
  }
};

/**
 * LOGIN DE USUARIO
 * POST /api/sessions/login
 * Autentica al usuario y genera un token JWT
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDACIÓN: Verificar que vengan email y password
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email y contraseña son obligatorios",
      });
    }

    // BUSCAR USUARIO por email
    // No usamos select("-password") porque necesitamos comparar la contraseña
    const user = await User.findOne({ email }).populate("cart");

    // VALIDACIÓN: Verificar que el usuario existe
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    // COMPARAR CONTRASEÑAS
    // Usamos el método comparePassword que creamos en el modelo
    const isPasswordValid = user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Credenciales inválidas",
      });
    }

    // GENERAR TOKEN JWT
    const token = generateToken(user);

    // RESPUESTA EXITOSA
    res.status(200).json({
      status: "success",
      message: "Login exitoso",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

/**
 * CURRENT USER
 * GET /api/sessions/current
 * Retorna los datos del usuario logueado
 * Esta ruta está protegida por el middleware requireAuth
 */
const current = async (req, res) => {
  try {
    // req.user fue agregado por el middleware requireAuth
    // Ya viene populado desde Passport (incluyendo el cart)

    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "No autorizado - Token inválido",
      });
    }

    // RESPUESTA EXITOSA
    res.status(200).json({
      status: "success",
      message: "Usuario autenticado",
      data: {
        user: req.user.toJSON(),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener usuario actual",
      error: error.message,
    });
  }
};

/**
 * LOGOUT
 * POST /api/sessions/logout
 * Con JWT no hay logout del lado del servidor
 * El cliente debe eliminar el token
 */
const logout = (req, res) => {
  // Con JWT stateless, el logout se maneja del lado del cliente
  // El cliente simplemente elimina el token del localStorage o cookies
  res.status(200).json({
    status: "success",
    message: "Logout exitoso - Elimine el token del cliente",
  });
};

module.exports = {
  register,
  login,
  current,
  logout,
};
