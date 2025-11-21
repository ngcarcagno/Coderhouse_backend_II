/**
 * USERS REPOSITORY
 * Capa intermedia entre el Service y el Modelo de Usuario
 * Implementa el patrón Repository para abstraer el acceso a datos
 */

const User = require("../models/user.model");

class UsersRepository {
  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async create(userData) {
    const user = await User.create(userData);
    return user;
  }

  /**
   * Buscar usuario por ID
   * @param {String} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findById(id) {
    return await User.findById(id).populate("cart");
  }

  /**
   * Buscar usuario por email
   * @param {String} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  async findByEmail(email) {
    return await User.findOne({ email }).populate("cart");
  }

  /**
   * Actualizar usuario
   * @param {String} id - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  /**
   * Eliminar usuario
   * @param {String} id - ID del usuario
   * @returns {Promise<Boolean>} true si se eliminó
   */
  async delete(id) {
    const result = await User.findByIdAndDelete(id);
    return result !== null;
  }

  /**
   * Verificar si un email ya existe
   * @param {String} email - Email a verificar
   * @returns {Promise<Boolean>} true si existe
   */
  async emailExists(email) {
    const user = await User.findOne({ email });
    return user !== null;
  }

  /**
   * Obtener todos los usuarios
   * @param {Object} filter - Filtros opcionales
   * @returns {Promise<Array>} Array de usuarios
   */
  async findAll(filter = {}) {
    return await User.find(filter).select("-password");
  }

  /**
   * Actualizar contraseña de usuario
   * @param {String} id - ID del usuario
   * @param {String} newPassword - Nueva contraseña (sin hashear)
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updatePassword(id, newPassword) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.password = newPassword; // El pre-save hook hasheará automáticamente
    await user.save();
    return user;
  }

  /**
   * Asignar carrito a usuario
   * @param {String} userId - ID del usuario
   * @param {String} cartId - ID del carrito
   * @returns {Promise<Object>} Usuario actualizado
   */
  async assignCart(userId, cartId) {
    return await User.findByIdAndUpdate(userId, { cart: cartId }, { new: true });
  }
}

module.exports = UsersRepository;
