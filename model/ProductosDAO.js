const pool = require("../db");
const Producto = require("../clases/Producto");
const ProductoDigital = require("../clases/ProductoDigital");

//Crear
//funciones que sirvan para añadir productos a la bbdd
const insertarProducto = async (producto) => {
  //necesito componer una serie de variables por separado (nombre, precio, stock)
  const { nombre, precio, stock } = producto;
  //si trabajamos con bbdd relacionales necesitamos una consulta de insercion
  const result = await pool.query(
    `INSERT INTO productos (nombre, precio, stock, tipo)
    VALUES ($1, $2, $3, "FISICO")
    RETURNING *`,
    [nombre, precio, stock],
  );
  return result.rows[0];
};
