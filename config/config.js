const path = require("path");
const dotenv = require("dotenv");

// Cargar variables de entorno según el ambiente

// NODE_ENV se establece al arrancar la app (desde npm scripts).
const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
dotenv.config({ path: path.join(__dirname, "..", envFile) });

// Validación de variables críticas
const requiredEnvVars = ["NODE_ENV", "PORT", "DB_NAME"];

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missing.length > 0) {
    console.error(`❌ Variables de entorno faltantes: ${missing.join(", ")}`);
    process.exit(1);
  }
};

validateEnvironment();

const config = {
  PORT: process.env.PORT || 8080,
  getFilePath: (filename) => path.join(__dirname, `../data/${filename}`),
  paths: {
    views: path.join(__dirname, "../src/views"),
    public: path.join(__dirname, "../public"),
    upload: path.join(__dirname, "../uploads"),
  },

  // Base de datos
  database: {
    port: parseInt(process.env.DB_PORT) || 27017,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Si MONGO_URI no está definido o contiene placeholders (<...>), construimos la URI
    uri: (() => {
      const raw = process.env.MONGO_URI || "";
      const hasPlaceholders = raw.includes("<") && raw.includes(">");
      if (raw && !hasPlaceholders) return raw;

      const user = process.env.DB_USER || "";
      const pass = process.env.DB_PASSWORD || "";
      const cluster = process.env.DB_CLUSTER || "";
      const name = process.env.DB_NAME || "";
      const appName = process.env.DB_APP_NAME || "app";

      if (!cluster) return raw; // no tenemos suficiente info para construirla

      const encodedUser = encodeURIComponent(user);
      const encodedPass = encodeURIComponent(pass);
      return `mongodb+srv://${encodedUser}:${encodedPass}@${cluster}/${name}?retryWrites=true&w=majority&appName=${encodeURIComponent(
        appName
      )}`;
    })(),
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
    timeout: parseInt(process.env.DB_TIMEOUT) || 5000,
    socketTimeout: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
  },

  // Configuración de Email
  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true", // true para 465, false para 587
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASSWORD || "",
    fromName: process.env.EMAIL_FROM_NAME || "E-commerce Backend II",
  },

  // JWT y Seguridad
  jwt: {
    secret: process.env.JWT_SECRET || "secret-key-default",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    resetSecret: process.env.JWT_RESET_SECRET || "reset-secret-default",
    resetExpiresIn: process.env.JWT_RESET_EXPIRES_IN || "1h",
  },

  // URLs del Frontend
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:3000",
    resetPasswordPath: process.env.RESET_PASSWORD_PATH || "/reset-password",
  },
};

module.exports = config;
