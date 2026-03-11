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
  // Añadimos tamano_descarga_mb: null para que el objeto tenga siempre la misma estructura
  // (aunque sea un producto físico, el campo existe pero es null)
  return {
    ...productoInsertado,
    precio: productoInsertado.precio.toString(),
    tamano_descarga_mb: null,
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
  // Aceptamos AMBOS nombres: tamañoDescarga (con tilde) y tamanoDescarga (sin tilde)
  // por si el formulario manda uno u otro
  const { nombre, precio, stock, tamañoDescarga, tamanoDescarga } =
    productoDigital;

  // Usamos el operador ?? (nullish coalescing) para elegir cuál usar
  // Si tamañoDescarga existe, lo usamos; si no, usamos tamanoDescarga
  // Si ninguno existe, size será undefined
  const size = tamañoDescarga ?? tamanoDescarga;

  // Usamos prisma.productos.create() para insertar un nuevo producto
  // Pero esta vez, además de los datos básicos, también creamos el registro relacionado
  const productoDigitalInsertado = await prisma.productos.create({
    data: {
      nombre,
      precio: new Prisma.Decimal(precio),
      stock: Number(stock),
      tipo: "DIGITAL", // Especificamos que es un producto digital
      // productos_digitales: { create: {...} } crea un registro relacionado
      // Nota: ahora es un objeto directo, no un array como antes
      // Es como decir: "Crea este producto Y también crea su información digital"
      productos_digitales: {
        create: {
          tamano_descarga_mb: Number(size),
        },
      },
    },
    // include: { productos_digitales: true } hace que Prisma retorne también
    // los datos del producto digital que acabamos de crear
    include: {
      productos_digitales: true,
    },
  });

  // Obtenemos el primer (y único) registro digital usando optional chaining ?.
  // Si no existe, firstDigital será undefined
  const firstDigital = productoDigitalInsertado.productos_digitales?.[0];

  // Construimos manualmente el objeto de retorno con todos los campos normalizados
  // Convertimos el precio a string y el tamaño a número
  return {
    id: productoDigitalInsertado.id,
    nombre: productoDigitalInsertado.nombre,
    precio: productoDigitalInsertado.precio.toString(),
    stock: productoDigitalInsertado.stock,
    tipo: productoDigitalInsertado.tipo,
    tamano_descarga_mb: firstDigital ? firstDigital.tamano_descarga_mb : null,
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
  // Mapeamos cada producto para normalizarlo
  // En lugar de usar una función auxiliar, hacemos la transformación inline
  return productos.map((producto) => {
    // Usamos optional chaining ?. para acceder al primer producto digital
    // Si no existe, firstDigital será undefined
    const firstDigital = producto.productos_digitales?.[0];
    // Retornamos un objeto con todos los campos normalizados
    // Convertimos el precio a string y el tamaño a número (o null si no existe)
    return {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      stock: producto.stock,
      tipo: producto.tipo,
      tamano_descarga_mb: firstDigital ? firstDigital.tamano_descarga_mb : null,
    };
  });
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

  // Usamos optional chaining ?. para acceder al primer producto digital
  // Si no existe, firstDigital será undefined
  const firstDigital = producto.productos_digitales?.[0];

  // Construimos manualmente el objeto de retorno con todos los campos normalizados
  // Convertimos el precio a string y el tamaño a número (o null si no existe)
  return {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio.toString(),
    stock: producto.stock,
    tipo: producto.tipo,
    tamano_descarga_mb: firstDigital ? firstDigital.tamano_descarga_mb : null,
  };
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
 * FUNCIÓN: actualizarProductoDigital
 *
 * Actualiza el tamaño de descarga de un producto digital.
 * Busca por el ID del producto (no por el ID del producto digital).
 *
 * NOTA: Esta función usa una estrategia de DOS PASOS:
 * 1. Primero busca el registro digital relacionado con el producto
 * 2. Luego actualiza ese registro específico por su ID
 */
const actualizarProductoDigital = async (id, tamanoDescarga) => {
  // PASO 1: Buscamos el primer registro de productos_digitales relacionado con este producto
  // findFirst() busca el primer registro que cumpla la condición
  // where: { producto_id: Number(id) } filtra por el ID del producto
  // orderBy: { id: "asc" } ordena por ID ascendente (aunque probablemente solo haya uno)
  const productoDigital = await prisma.productos_digitales.findFirst({
    where: { producto_id: Number(id) },
    orderBy: { id: "asc" },
  });

  // Si no existe un registro digital para este producto, retornamos null
  if (!productoDigital) return null;

  // PASO 2: Actualizamos el registro digital que encontramos
  // Usamos el ID específico del registro digital (no el ID del producto)
  // data: { tamano_descarga_mb: Number(tamanoDescarga) } actualiza el tamaño
  return prisma.productos_digitales.update({
    where: { id: productoDigital.id },
    data: {
      tamano_descarga_mb: Number(tamanoDescarga),
    },
  });
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
 * FUNCIÓN: cerrar
 *
 * Desconecta el cliente de Prisma de la base de datos.
 * Esto es importante para liberar recursos y cerrar las conexiones correctamente.
 * Se debe llamar cuando la aplicación se está cerrando o cuando ya no necesitas
 * hacer más consultas a la base de datos.
 */
const cerrar = async () => {
  // prisma.$disconnect() cierra todas las conexiones del pool
  // El $ indica que es un método especial de Prisma (no una tabla)
  // await espera a que se cierren todas las conexiones antes de continuar
  await prisma.$disconnect();
};

/**
 * EXPORTAMOS TODAS LAS FUNCIONES
 *
 * Estas funciones se exportan como un objeto para que otros archivos
 * puedan importarlas y usarlas. Por ejemplo:
 * const { obtenerTodos, insertarProducto } = require("./ProductosORM");
 *
 * Cada función es una operación CRUD (Create, Read, Update, Delete) o de gestión
 * de la conexión con la base de datos usando Prisma.
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
