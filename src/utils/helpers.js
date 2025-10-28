/**
 * Normaliza un resultado que puede ser: array, objeto paginado { docs, ... } o { payload: [...] }
 * @param {*} result - El resultado a normalizar
 * @returns {Array} - Array de documentos
 */
function extractDocs(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (result.docs !== undefined && Array.isArray(result.docs)) return result.docs;
  if (result.payload !== undefined && Array.isArray(result.payload)) return result.payload;
  return [];
}

module.exports = {
  extractDocs,
};
