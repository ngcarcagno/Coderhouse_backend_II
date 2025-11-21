/**
 * USER DTO (Data Transfer Object)
 * Clase para transferir datos de usuario sin información sensible
 * Evita exponer campos como password, timestamps internos, etc.
 */

class UserDTO {
  constructor(user) {
    // Campos públicos del usuario
    // Manejar tanto _id (Mongoose document) como id (objeto plano)
    this.id = user._id?.toString() || user.id?.toString() || user._id || user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;

    // Información del carrito (solo el ID)
    // Manejar tanto cart como objeto poblado o como simple ID
    if (user.cart) {
      if (typeof user.cart === "object" && (user.cart._id || user.cart.id)) {
        this.cart = user.cart._id?.toString() || user.cart.id?.toString();
      } else {
        this.cart = user.cart.toString();
      }
    } else {
      this.cart = null;
    }

    // Nombre completo (helper)
    this.full_name = `${user.first_name} ${user.last_name}`;
  }

  /**
   * Crear DTO desde un objeto User de Mongoose
   * @param {Object} user - Documento de usuario
   * @returns {UserDTO} Instancia del DTO
   */
  static fromModel(user) {
    if (!user) return null;
    return new UserDTO(user);
  }

  /**
   * Crear múltiples DTOs desde un array de usuarios
   * @param {Array} users - Array de documentos de usuario
   * @returns {Array<UserDTO>} Array de DTOs
   */
  static fromModelArray(users) {
    if (!Array.isArray(users)) return [];
    return users.map((user) => new UserDTO(user));
  }
}

module.exports = UserDTO;
