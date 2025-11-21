const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const User = require("../src/models/user.model");
const { JWT_SECRET } = require("../src/utils/jwt.utils");

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  return token;
};

const jwtOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).populate("cart").select("-password").lean();

      if (!user) {
        return done(null, false, { message: "Usuario no encontrado" });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

passport.use(
  "current",
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id).populate("cart").select("-password").lean();

      if (!user) {
        return done(null, false, { message: "Usuario no encontrado" });
      }

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

module.exports = passport;
