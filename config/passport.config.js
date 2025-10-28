const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../src/models/user.model");
const { JWT_SECRET } = require("../src/utils/jwt.utils");

/**
 * CONFIGURACIÓN DE LA ESTRATEGIA JWT
 * Define cómo Passport debe validar los tokens JWT
 */

// OPCIONES DE LA ESTRATEGIA
const jwtOptions = {
  // jwtFromRequest: Define CÓMO extraer el token del request
  // ExtractJwt.fromAuthHeaderAsBearerToken() busca en el header:
  // Authorization: Bearer <token>
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

  // secretOrKey: Clave secreta para verificar la firma del token
  // Debe ser la MISMA que usamos para generar el token
  secretOrKey: JWT_SECRET,
};

// ESTRATEGIA JWT
// El callback se ejecuta cuando Passport valida el token
passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      // jwt_payload contiene los datos que pusimos en el token (id, email, role)
      // Buscamos el usuario en la BD usando el ID del payload
      const user = await User.findById(jwt_payload.id)
        .populate("cart") // Traemos también los datos del carrito
        .select("-password"); // Excluimos el password

      if (!user) {
        // Si no existe el usuario, el token es válido pero el usuario fue eliminado
        return done(null, false, { message: "Usuario no encontrado" });
      }

      // Si todo está bien, retornamos el usuario
      // Este usuario quedará disponible en req.user en las rutas protegidas
      return done(null, user);
    } catch (error) {
      // Si hay un error en la BD, lo reportamos
      return done(error, false);
    }
  })
);

/**
 * ESTRATEGIA "CURRENT"
 * Estrategia específica para el endpoint /api/sessions/current
 * Funciona igual que la estrategia JWT pero con un nombre específico
 */
passport.use(
  "current",
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).populate("cart").select("-password");

      if (!user) {
        return done(null, false, { message: "Usuario no encontrado" });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Exportamos passport configurado
module.exports = passport;
