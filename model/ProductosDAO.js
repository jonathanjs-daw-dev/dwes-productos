const pool = require("../db/db");
const Producto = require("../clases/Producto");
const ProductoDigital = require("../clases/ProductoDigital");

//Crear
//funciones que sirvan para añadir productos a la bbdd
//Función insertarProducto: Inserta un producto FISICO en la bbdd PostgreSQL. Recibe un obj Producto y lo guarda en la tabla "productos"
const insertarProducto = async (producto) => {
  //necesito componer una serie de variables por separado (nombre, precio, stock)
  const { nombre, precio, stock } = producto;
  //si trabajamos con bbdd relacionales necesitamos una consulta de insercion
  const result = await pool.query(
    `INSERT INTO productos (nombre, precio, stock, tipo)
    VALUES ($1, $2, $3, 'FISICO')
    RETURNING *`,
    [nombre, precio, stock],
  );
  return result.rows[0];
};

const insertarProductoDigital = async (productoDigital) => {
  const { nombre, precio, stock, tamDescarga } = productoDigital;

  const resultProducto = await pool.query(
    `INSERT INTO productos (nombre, precio, stock, tipo)
    VALUES ($1, $2, $3, 'DIGITAL')
    RETURNING *`,
    [nombre, precio, stock],
  );

  const productoId = resultProducto.rows[0].id;

  const resultProductoDigital = await pool.query(
    `INSERT INTO productos_digitales (producto_id, tamano_descarga_mb)
    VALUES ($1, $2)
    RETURNING *`,
    [productoId, tamDescarga],
  );

  return {
    ...resultProducto.rows[0],
    tamano_descarga_mb: resultProductoDigital.rows[0].tamano_descarga_mb,
  };
};

const obtenerTodos = async () => {
  const resultado = await pool.query(
    `SELECT p.id, p.nombre, p.precio, p.stock, p.tipo,
    d.tamano_descarga_mb
    FROM productos p
    LEFT JOIN productos_digitales d ON d.producto_id = p.id
    ORDER BY p.id`,
  );

  return resultado.rows;
};

const obtenerProductoPorId = async (id) => {
  const resultado = await pool.query(
    `SELECT p.id, p.nombre, p.precio, p.stock, p.tipo,
    d.tamano_descarga_mb
    FROM productos p
    LEFT JOIN productos_digitales d ON d.producto_id = p.id
    WHERE p.id = $1
    `,
    [id],
  );
  return resultado.rows[0] || null;
};

const actualizarProducto = async (id, datos) => {
  const { nombre, precio, stock } = datos;
  const resultado = await pool.query(
    ` UPDATE productos
      SET nombre = $1,
        precio = $2,
        stock = $3
      WHERE id = $4
      RETURNING *`,
    [nombre, precio, stock, id],
  );
  return resultado.rows[0] || null;
};

const actualizarProductoDigital = async (id, tamanoDescarga) => {
  const resultado = await pool.query(
    ` UPDATE productos_digitales
      SET tamano_descarga_mb = $1
      WHERE producto_id = $2
      RETURNING *`,
    [tamanoDescarga, id],
  );
  return resultado.rows[0] || null;
};

const borrarProducto = async (id) => {
  const result = await pool.query(
    ` DELETE FROM productos
      WHERE id = $1`,
    [id],
  );
};

//todo - borrar producto digital

module.exports = {
  insertarProducto,
  insertarProductoDigital,
  obtenerTodos,
  obtenerProductoPorId,
  actualizarProducto,
  actualizarProductoDigital,
  borrarProducto,
};
