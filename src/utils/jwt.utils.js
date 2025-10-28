const jwt = require("jsonwebtoken");

// CLAVE SECRETA: Usada para firmar y verificar los tokens
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ ADVERTENCIA: JWT_SECRET no está definido en .env");
}
const JWT_SECRET = process.env.JWT_SECRET || "clave_por_defecto_cambiar_URGENTE";

// DURACIÓN DEL TOKEN: Tiempo que el token será válido
const JWT_EXPIRATION = "24h";

/**
 * GENERAR TOKEN JWT
 * Crea un token firmado con los datos del usuario
 * @param {Object} user - Documento de usuario de MongoDB
 * @returns {String} Token JWT firmado
 */
const generateToken = (user) => {
  // PAYLOAD: Datos que queremos incluir en el token
  // NO incluir información sensible (contraseñas, datos bancarios, etc)
  const payload = {
    id: user._id, // ID del usuario en MongoDB
    email: user.email,
    role: user.role,
  };

  // jwt.sign(payload, secret, options)
  // Genera y firma el token
  const token = jwt.sign(
    payload, // Datos a incluir
    JWT_SECRET, // Clave secreta para firmar
    { expiresIn: JWT_EXPIRATION } // Opciones: tiempo de expiración
  );

  return token;
};

/**
 * VERIFICAR TOKEN JWT
 * Valida que el token sea auténtico y no haya expirado
 * @param {String} token
 * @returns {Object}
 * @throws {Error}
 */
const verifyToken = (token) => {
  try {
    // Si el token fue alterado o expiró, lanza un error
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error(`Token inválido: ${error.message}`);
  }
};

/**
 * EXTRAER TOKEN DEL HEADER
 * @param {Object} req
 * @returns {String|null}
 */
const extractTokenFromHeader = (req) => {
  // El formato esperado es: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Separamos "Bearer" del token
  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1]; // Retornamos solo el token
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  JWT_SECRET,
};
