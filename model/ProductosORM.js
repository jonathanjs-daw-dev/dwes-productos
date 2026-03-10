// Importamos PrismaClient (el cliente principal de Prisma para interactuar con la base de datos)
// y Prisma (objeto que contiene utilidades y tipos de Prisma)
// desde el paquete @prisma/client que se genera automáticamente cuando ejecutas "npx prisma generate"
const { PrismaClient, Prisma } = require("@prisma/client");

// Importamos PrismaPg, que es un adaptador especial que permite a Prisma
// trabajar con PostgreSQL usando el driver nativo de Node.js (pg)
// en lugar del driver por defecto de Prisma
const { PrismaPg } = require("@prisma/adapter-pg");

// Importamos Pool desde el paquete 'pg' (node-postgres)
// Pool es como una "piscina" de conexiones a la base de datos
// que se reutilizan en lugar de crear una nueva conexión cada vez
const { Pool } = require("pg");

// Creamos un "pool" (grupo) de conexiones a PostgreSQL
// Piensa en esto como tener varias líneas telefónicas abiertas con la base de datos
// en lugar de tener que marcar el número cada vez que quieres hablar
const pgPool = new Pool({
  // connectionString es la "dirección" completa de nuestra base de datos
  // La obtenemos de las variables de entorno (archivo .env)
  // Tiene un formato como: postgresql://usuario:contraseña@servidor:puerto/nombre_base_datos
  connectionString: process.env.DATABASE_URL,
});

// Creamos el adaptador que conecta Prisma con nuestro pool de PostgreSQL
// Es como un "traductor" que permite que Prisma hable con PostgreSQL
// usando las conexiones que creamos en pgPool
const adapter = new PrismaPg(pgPool);

// Finalmente, creamos nuestro cliente de Prisma
// Este es el objeto principal que usaremos para hacer consultas a la base de datos
// Le pasamos el adaptador para que use nuestro pool de conexiones de PostgreSQL
// A partir de aquí, 'prisma' será nuestro punto de acceso a la base de datos
const prisma = new PrismaClient({ adapter });

/**
 * FUNCIÓN AUXILIAR: normalizarProducto
 *
 * Esta función es un "formateador" que convierte los datos que trae Prisma
 * a un formato que podamos usar fácilmente en JSON (para enviar al cliente).
 *
 * ¿Por qué existe? Prisma devuelve el precio como tipo "Decimal" (para precisión),
 * pero JSON no entiende ese tipo, así que lo convertimos a string.
 * También extraemos el primer producto digital si existe.
 */
const normalizarProducto = (producto) => {
  // Buscamos si hay productos digitales relacionados con este producto
  // Si existen, tomamos el primero; si no, asignamos null
  const primerDigital =
    producto.productos_digitales && producto.productos_digitales.length > 0
      ? producto.productos_digitales[0]
      : null;

  // Retornamos un objeto con los datos formateados y listos para JSON
  return {
    id: producto.id,
    nombre: producto.nombre,
    // Convertimos el Decimal de Prisma a string para que JSON lo entienda
    precio: producto.precio.toString(),
    stock: producto.stock,
    tipo: producto.tipo,
    // Si hay producto digital, incluimos su tamaño; si no, null
    tamano_descarga_mb: primerDigital ? primerDigital.tamano_descarga_mb : null,
  };
};

/**
 * FUNCIÓN: obtenerTodos
 *
 * Trae TODOS los productos de la base de datos.
 * Es una función asincrónica (async) porque la consulta a BD tarda tiempo.
 */
const obtenerTodos = async () => {
  // Usamos prisma.productos.findMany() para traer todos los registros
  // include: { productos_digitales: true } significa "trae también los datos relacionados"
  // orderBy: { id: "asc" } ordena los resultados por ID de menor a mayor
  const productos = await prisma.productos.findMany({
    include: { productos_digitales: true },
    orderBy: { id: "asc" },
  });
  // Normalizamos cada producto (convertimos Decimal a string, etc.)
  // y retornamos el array de productos formateados
  return productos.map(normalizarProducto);
};

/**
 * FUNCIÓN: obtenerProductoPorId
 *
 * Busca UN SOLO producto por su ID en la base de datos.
 * Retorna null si no encuentra el producto.
 */
const obtenerProductoPorId = async (id) => {
  // Usamos findUnique() porque buscamos por ID (que es único)
  // Number(id) convierte el ID a número (por si viene como string)
  // include: { productos_digitales: true } trae también los datos relacionados
  const producto = await prisma.productos.findUnique({
    where: { id: Number(id) },
    include: { productos_digitales: true },
  });
  // Si no existe el producto, retornamos null
  if (!producto) return null;
  // Si existe, lo normalizamos y lo retornamos
  return normalizarProducto(producto);
};

/**
 * FUNCIÓN: actualizarProducto
 *
 * Modifica los datos de un producto existente (nombre, precio, stock).
 * Recibe el ID del producto y un objeto con los nuevos datos.
 */
const actualizarProducto = async (id, datos) => {
  // Extraemos los campos que queremos actualizar del objeto datos
  const { nombre, precio, stock } = datos;
  // Usamos prisma.productos.update() para modificar un registro existente
  // where: { id: Number(id) } especifica cuál es el producto a actualizar
  // data: { ... } contiene los nuevos valores
  // new Prisma.Decimal(precio) convierte el precio a tipo Decimal (para precisión)
  // Number(stock) convierte el stock a número
  const productoActualizado = await prisma.productos.update({
    where: { id: Number(id) },
    data: {
      nombre,
      precio: new Prisma.Decimal(precio),
      stock: Number(stock),
    },
  });
  // Retornamos el producto actualizado, pero normalizamos el precio a string
  return {
    ...productoActualizado,
    precio: productoActualizado.precio.toString(),
  };
};

/**
 * FUNCIÓN: actualizarProductoDigitalPorProductoId
 *
 * Actualiza el tamaño de descarga de un producto digital.
 * Busca por el ID del producto (no por el ID del producto digital).
 */
const actualizarProductoDigitalPorProductoId = async (
  productoId,
  tamanoDescarga,
) => {
  // Usamos updateMany() porque puede haber múltiples registros de productos_digitales
  // para el mismo producto (aunque en este caso probablemente solo haya uno)
  // where: { producto_id: Number(productoId) } busca todos los registros relacionados
  // data: { tamano_descarga_mb: Number(tamanoDescarga) } actualiza el tamaño
  const productoDigitalActualizado =
    await prisma.productos_digitales.updateMany({
      where: { producto_id: Number(productoId) },
      data: {
        tamano_descarga_mb: Number(tamanoDescarga),
      },
    });
  // Retornamos el resultado de la actualización
  return productoDigitalActualizado;
};

/**
 * FUNCIÓN: borrarProducto
 *
 * Elimina un producto de la base de datos por su ID.
 * Nota: Si el producto es digital, también se eliminarán sus registros relacionados
 * en la tabla productos_digitales (gracias a las restricciones de la BD).
 */
const borrarProducto = async (id) => {
  // Usamos prisma.productos.delete() para eliminar un registro
  // where: { id: Number(id) } especifica cuál es el producto a eliminar
  await prisma.productos.delete({
    where: { id: Number(id) },
  });
};

/**
 * FUNCIÓN: insertarProducto
 *
 * Crea un nuevo producto FÍSICO en la base de datos.
 * Recibe un objeto con nombre, precio y stock.
 */
const insertarProducto = async (producto) => {
  // Extraemos los datos del producto que queremos insertar
  const { nombre, precio, stock } = producto;
  // Usamos prisma.productos.create() para insertar un nuevo registro
  // data: { ... } contiene los valores del nuevo producto
  // tipo: "FISICO" especifica que es un producto físico (no digital)
  // new Prisma.Decimal(precio) convierte el precio a tipo Decimal para precisión
  const productoInsertado = await prisma.productos.create({
    data: {
      nombre,
      precio: new Prisma.Decimal(precio),
      stock: Number(stock),
      tipo: "FISICO",
    },
  });
  // Retornamos el producto insertado, normalizando el precio a string
  return {
    ...productoInsertado,
    precio: productoInsertado.precio.toString(),
  };
};

/**
 * FUNCIÓN: insertarProductoDigital
 *
 * Crea un nuevo producto DIGITAL en la base de datos.
 * Este es más complejo que insertarProducto porque crea dos registros:
 * 1. Un registro en la tabla "productos"
 * 2. Un registro relacionado en la tabla "productos_digitales"
 */
const insertarProductoDigital = async (productoDigital) => {
  // Extraemos los datos del producto digital que queremos insertar
  const { nombre, precio, stock, tamanoDescarga } = productoDigital;
  // Usamos prisma.productos.create() para insertar un nuevo producto
  // Pero esta vez, además de los datos básicos, también creamos el registro relacionado
  const productoDigitalInsertado = await prisma.productos.create({
    data: {
      nombre,
      precio: new Prisma.Decimal(precio),
      stock: Number(stock),
      tipo: "DIGITAL", // Especificamos que es un producto digital
      // productos_digitales: { create: [...] } crea un registro relacionado
      // Es como decir: "Crea este producto Y también crea su información digital"
      productos_digitales: {
        create: [
          {
            tamano_descarga_mb: Number(tamanoDescarga),
          },
        ],
      },
    },
    // include: { productos_digitales: true } hace que Prisma retorne también
    // los datos del producto digital que acabamos de crear
    include: {
      productos_digitales: true,
    },
  });
  // Normalizamos el producto digital y lo retornamos
  return normalizarProducto(productoDigitalInsertado);
};
