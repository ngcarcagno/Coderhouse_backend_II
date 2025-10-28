const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// SCHEMA: Define la estructura del documento User
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "El apellido es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true, // No puede haber dos usuarios con el mismo email
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor ingrese un email válido"],
    },
    age: {
      type: Number,
      required: [true, "La edad es obligatoria"],
      min: [18, "Debes ser mayor de 18 años"],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      default: null, // Por defecto no tiene carrito
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
  }
);

// MIDDLEWARE DE PRE-SAVE: Hashea la contraseña antes de guardar
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next(); // Si no se modificó, continúa sin hashear
  }

  try {
    const hashedPassword = bcrypt.hashSync(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// MÉTODO DE INSTANCIA: Para comparar contraseñas
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

// MÉTODO DE INSTANCIA: Para obtener datos sin información sensible
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password; // Elimina el campo password
  return user;
};

// Exportamos el modelo
module.exports = mongoose.model("User", userSchema);
