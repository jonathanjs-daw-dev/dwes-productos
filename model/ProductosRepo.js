/**
 * ARCHIVO: ProductosRepo.js
 *
 * Este archivo implementa el patrón "Repository" o "Adapter".
 * ¿Qué es? Es un intermediario que decide cuál implementación usar (DAO u ORM)
 * sin que el resto del código tenga que saber cuál está usando.
 *
 * VENTAJA: Si mañana quieres cambiar de DAO a ORM (o viceversa), solo cambias
 * una variable de entorno. El resto del código sigue funcionando igual.
 */

// Leemos la variable de entorno DATA_LAYER
// .trim() elimina espacios en blanco al inicio y final
// .toUpperCase() convierte a mayúsculas (por si alguien escribe "orm" o "Orm")
// === "ORM" comprueba si es exactamente "ORM"
// El resultado es true si queremos usar ORM, false si queremos usar DAO
const useORM = (process.env.DATA_LAYER || "").trim().toUpperCase() === "ORM";

// Log de depuración: imprime en la consola qué valor tiene DATA_LAYER
// Esto es útil para verificar que la variable de entorno se está leyendo correctamente
console.log("ENV_DATA_LAYER =", process.env.DATA_LAYER);

// Elegimos el proveedor (DAO u ORM) usando un operador ternario
// Si useORM es true, cargamos ProductosORM.js
// Si useORM es false, cargamos ProductosDAO.js (el valor por defecto)
// require() carga el módulo y lo asigna a la variable proveedor
const proveedor = useORM
  ? require("./ProductosORM")
  : require("./ProductosDAO");

/**
 * EXPORTAMOS UN OBJETO CON TODAS LAS FUNCIONES
 *
 * Este es el patrón "Facade" (fachada):
 * - Exponemos las mismas funciones que tienen DAO y ORM
 * - Cada función simplemente delega al proveedor elegido
 * - El resto del código llama a estas funciones sin saber si usa DAO u ORM
 *
 * Ejemplo: cuando app.js hace repo.obtenerTodos(), esta función
 * llama a proveedor.obtenerTodos(), que puede ser DAO u ORM
 */
module.exports = {
  // Inserta un producto físico
  insertarProducto: (producto) => proveedor.insertarProducto(producto),

  // Inserta un producto digital (con datos adicionales)
  insertarProductoDigital: (productoDigital) =>
    proveedor.insertarProductoDigital(productoDigital),

  // Obtiene todos los productos
  obtenerTodos: () => proveedor.obtenerTodos(),

  // Obtiene un producto específico por su ID
  obtenerProductoPorId: (id) => proveedor.obtenerProductoPorId(id),

  // Actualiza los datos de un producto (nombre, precio, stock)
  actualizarProducto: (id, datos) => proveedor.actualizarProducto(id, datos),

  // Actualiza el tamaño de descarga de un producto digital
  actualizarProductoDigital: (id, tamanoDescarga) =>
    proveedor.actualizarProductoDigital(id, tamanoDescarga),

  // Elimina un producto de la base de datos
  borrarProducto: (id) => proveedor.borrarProducto(id),

  // Cierra la conexión con la base de datos (si es necesario)
  cerrar: () => proveedor.cerrar(),
};
