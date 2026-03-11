/**
 * ARCHIVO: ProductosDAO.js
 *
 * DAO = Data Access Object (Objeto de Acceso a Datos)
 * Este archivo contiene funciones que acceden DIRECTAMENTE a la base de datos
 * usando SQL puro (consultas SQL escritas a mano).
 *
 * DIFERENCIA CON ORM:
 * - DAO: Escribes SQL directamente (más control, más código)
 * - ORM: Usas métodos como .create(), .update() (menos código, menos control)
 */

// Importamos el pool de conexiones a PostgreSQL desde db.js
// pool es nuestro "teléfono" para hablar con la base de datos
const pool = require("../db/db");

// Importamos las clases Producto y ProductoDigital
// (aunque en este archivo no se usan, podrían ser útiles para validaciones)
const Producto = require("../clases/Producto");
const ProductoDigital = require("../clases/ProductoDigital");

/**
 * FUNCIÓN: insertarProducto
 *
 * Inserta un nuevo producto FÍSICO en la base de datos.
 * Recibe un objeto con nombre, precio y stock.
 */
const insertarProducto = async (producto) => {
  // Extraemos los datos del producto usando destructuring
  const { nombre, precio, stock } = producto;

  // Ejecutamos una consulta SQL INSERT
  // $1, $2, $3 son placeholders (espacios para los valores)
  // Esto previene ataques de SQL injection
  // RETURNING * devuelve el registro que acabamos de insertar
  const result = await pool.query(
    `INSERT INTO productos (nombre, precio, stock, tipo)
    VALUES ($1, $2, $3, 'FISICO')
    RETURNING *`,
    [nombre, precio, stock], // Los valores se pasan aquí, en orden
  );
  // Retornamos el primer (y único) registro insertado
  return result.rows[0];
};

/**
 * FUNCIÓN: insertarProductoDigital
 *
 * Inserta un nuevo producto DIGITAL en la base de datos.
 * Es más complejo que insertarProducto porque necesita hacer DOS inserciones:
 * 1. Primero inserta en la tabla "productos"
 * 2. Luego inserta en la tabla "productos_digitales" (relacionada)
 */
const insertarProductoDigital = async (productoDigital) => {
  // Extraemos los datos del producto digital
  const { nombre, precio, stock, tamanoDescarga } = productoDigital;

  // PASO 1: Insertamos el producto en la tabla "productos"
  // Especificamos tipo: 'DIGITAL' para indicar que es un producto digital
  const resultProducto = await pool.query(
    `INSERT INTO productos (nombre, precio, stock, tipo)
    VALUES ($1, $2, $3, 'DIGITAL')
    RETURNING *`,
    [nombre, precio, stock],
  );

  // Obtenemos el ID del producto que acabamos de insertar
  // Lo necesitamos para crear la relación en la tabla productos_digitales
  const productoId = resultProducto.rows[0].id;

  // PASO 2: Insertamos los datos específicos del producto digital
  // Usamos el productoId para crear la relación entre las dos tablas
  const resultProductoDigital = await pool.query(
    `INSERT INTO productos_digitales (producto_id, tamano_descarga_mb)
    VALUES ($1, $2)
    RETURNING *`,
    [productoId, tamanoDescarga],
  );

  // Retornamos un objeto que combina los datos del producto con los datos digitales
  // Usamos el spread operator (...) para copiar todos los campos del producto
  // y luego añadimos el tamano_descarga_mb
  return {
    ...resultProducto.rows[0],
    tamano_descarga_mb: resultProductoDigital.rows[0].tamano_descarga_mb,
  };
};

/**
 * FUNCIÓN: obtenerTodos
 *
 * Trae TODOS los productos de la base de datos.
 * Usa un LEFT JOIN para traer también los datos de productos_digitales si existen.
 */
const obtenerTodos = async () => {
  // Ejecutamos una consulta SELECT que trae todos los productos
  // SELECT p.id, p.nombre... especifica qué columnas queremos
  // FROM productos p: traemos de la tabla "productos" (alias "p")
  // LEFT JOIN productos_digitales d: también traemos datos de productos_digitales si existen
  //   LEFT JOIN significa: "trae todos los productos, y si hay datos digitales, inclúyelos"
  // ON d.producto_id = p.id: la condición para unir las tablas
  // ORDER BY p.id: ordena los resultados por ID de menor a mayor
  const resultado = await pool.query(
    `SELECT p.id, p.nombre, p.precio, p.stock, p.tipo,
    d.tamano_descarga_mb
    FROM productos p
    LEFT JOIN productos_digitales d ON d.producto_id = p.id
    ORDER BY p.id`,
  );

  // Retornamos todos los registros encontrados
  return resultado.rows;
};

/**
 * FUNCIÓN: obtenerProductoPorId
 *
 * Busca UN SOLO producto por su ID.
 * Retorna null si no encuentra el producto.
 */
const obtenerProductoPorId = async (id) => {
  // Similar a obtenerTodos, pero con una condición WHERE
  // WHERE p.id = $1 filtra para traer solo el producto con ese ID
  // $1 es un placeholder que se reemplaza con el valor de [id]
  const resultado = await pool.query(
    `SELECT p.id, p.nombre, p.precio, p.stock, p.tipo,
    d.tamano_descarga_mb
    FROM productos p
    LEFT JOIN productos_digitales d ON d.producto_id = p.id
    WHERE p.id = $1
    `,
    [id],
  );
  // Retornamos el primer registro si existe, o null si no hay resultados
  // resultado.rows[0] es el primer registro
  // || null es un fallback por si resultado.rows está vacío
  return resultado.rows[0] || null;
};

/**
 * FUNCIÓN: actualizarProducto
 *
 * Modifica los datos de un producto existente (nombre, precio, stock).
 * Retorna null si el producto no existe.
 */
const actualizarProducto = async (id, datos) => {
  // Extraemos los campos que queremos actualizar
  const { nombre, precio, stock } = datos;
  // Ejecutamos una consulta UPDATE
  // SET nombre = $1, precio = $2, stock = $3 especifica qué campos cambiar
  // WHERE id = $4 especifica cuál es el producto a actualizar
  // RETURNING * devuelve el registro actualizado
  const resultado = await pool.query(
    ` UPDATE productos
      SET nombre = $1,
        precio = $2,
        stock = $3
      WHERE id = $4
      RETURNING *`,
    [nombre, precio, stock, id], // Los valores en orden: $1, $2, $3, $4
  );
  // Retornamos el registro actualizado, o null si no existe
  return resultado.rows[0] || null;
};

/**
 * FUNCIÓN: actualizarProductoDigital
 *
 * Actualiza el tamaño de descarga de un producto digital.
 * Busca por el ID del producto (no por el ID del producto digital).
 */
const actualizarProductoDigital = async (id, tamanoDescarga) => {
  // Ejecutamos una consulta UPDATE en la tabla productos_digitales
  // SET tamano_descarga_mb = $1 actualiza el tamaño de descarga
  // WHERE producto_id = $2 busca por el ID del producto
  // RETURNING * devuelve el registro actualizado
  const resultado = await pool.query(
    ` UPDATE productos_digitales
      SET tamano_descarga_mb = $1
      WHERE producto_id = $2
      RETURNING *`,
    [tamanoDescarga, id], // $1 = tamanoDescarga, $2 = id
  );
  // Retornamos el registro actualizado, o null si no existe
  return resultado.rows[0] || null;
};

/**
 * FUNCIÓN: borrarProducto
 *
 * Elimina un producto de la base de datos por su ID.
 * Nota: Si el producto es digital, también se eliminarán sus registros relacionados
 * en la tabla productos_digitales (gracias a las restricciones de la BD).
 */
const borrarProducto = async (id) => {
  // Ejecutamos una consulta DELETE
  // DELETE FROM productos elimina de la tabla productos
  // WHERE id = $1 especifica cuál es el producto a eliminar
  const result = await pool.query(
    ` DELETE FROM productos
      WHERE id = $1`,
    [id],
  );
};

/**
 * FUNCIÓN: cerrar
 *
 * Cierra la conexión del pool con la base de datos.
 * Esto es importante para liberar recursos cuando la aplicación se está cerrando.
 */
const cerrar = async () => {
  // pool.end() cierra todas las conexiones del pool
  // await espera a que se cierren todas las conexiones antes de continuar
  await pool.end();
};

/**
 * EXPORTAMOS TODAS LAS FUNCIONES
 *
 * Estas funciones se exportan como un objeto para que otros archivos
 * puedan importarlas y usarlas. Por ejemplo:
 * const { obtenerTodos, insertarProducto } = require("./ProductosDAO");
 */
module.exports = {
  insertarProducto,
  insertarProductoDigital,
  obtenerTodos,
  obtenerProductoPorId,
  actualizarProducto,
  actualizarProductoDigital,
  borrarProducto,
  cerrar,
};
