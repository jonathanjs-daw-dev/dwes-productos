// ---------------------------
// IMPORTACIONES
// ---------------------------
// Express: Framework web para Node.js que facilita la creación de servidores y APIs
const express = require("express");
// express-ejs-layouts: Middleware que permite usar layouts compartidos en las vistas EJS
const layouts = require("express-ejs-layouts");
// path: Módulo nativo de Node.js para trabajar con rutas de archivos y directorios
const path = require("path");
// ProductosDAO: Capa de acceso a datos que contiene las funciones para interactuar con la base de datos
const pDAO = require("./model/ProductosDAO");

// ---------------------------
// CONFIGURACIÓN INICIAL
// ---------------------------
// Creamos la aplicación Express
const app = express();
// Puerto en el que escuchará el servidor
const PORT = 3000;

// ---------------------------
// CONFIGURACIÓN DEL MOTOR DE VISTAS
// ---------------------------
// Establecemos EJS como motor de plantillas para renderizar HTML dinámico
app.set("view engine", "ejs");
// Indicamos dónde están ubicadas las vistas (carpeta 'views')
app.set("views", path.join(__dirname, "views"));

// ---------------------------
// MIDDLEWARES
// ---------------------------
// Middleware para parsear datos de formularios HTML (application/x-www-form-urlencoded)
// extended: true permite parsear objetos anidados
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos (CSS, imágenes, JS) desde la carpeta 'public'
app.use(express.static("public"));

// Middleware para usar layouts compartidos (evita duplicar HTML en cada vista)
app.use(layouts);
// Establecemos 'layout.ejs' como plantilla base para todas las vistas
app.set("layout", "layout");

// ---------------------------
// RUTAS - OPERACIONES CRUD
// ---------------------------

// RUTA: Página principal - Redirige al listado de productos
// GET /
app.get("/", (req, res) => {
  res.redirect("/productos");
});

// RUTA: Listar todos los productos
// GET /productos
app.get("/productos", async (req, res) => {
  try {
    // Obtenemos todos los productos de la base de datos
    const productos = await pDAO.obtenerTodos();
    // Renderizamos la vista 'productos/lista.ejs' pasándole los datos
    res.render("productos/lista", { productos, title: "Listado de Productos" });
  } catch (err) {
    // Si hay un error, lo mostramos en consola y enviamos un mensaje al cliente
    console.error("Error al obtener productos:", err);
    res.status(500).send("Error al obtener productos");
  }
});

// RUTA: Mostrar formulario para crear un nuevo producto
// GET /productos/nuevo
app.get("/productos/nuevo", (req, res) => {
  // Renderizamos la vista con el formulario vacío
  res.render("productos/nuevo", { title: "Nuevo Producto" });
});

// RUTA: Procesar el formulario de creación de producto
// POST /productos
app.post("/productos", async (req, res) => {
  try {
    // Extraemos los datos del formulario enviado por el cliente
    const { nombre, precio, stock } = req.body;
    // Creamos un objeto producto asegurándonos de que precio y stock sean números
    const producto = { nombre, precio: Number(precio), stock: Number(stock) };
    // Insertamos el producto en la base de datos
    await pDAO.insertarProducto(producto);
    // Redirigimos al listado de productos para ver el nuevo producto añadido
    res.redirect("/productos");
  } catch (error) {
    console.error("Error al crear el producto: ", error);
    res.status(500).send("Error al crear el producto");
  }
});

// RUTA: Mostrar formulario para editar un producto existente
// GET /productos/:id/editar
app.get("/productos/:id/editar", async (req, res) => {
  try {
    // Extraemos el ID del producto desde los parámetros de la URL y lo convertimos a número
    const id = Number(req.params.id);
    // Consultamos la base de datos para obtener el producto con ese ID
    const producto = await pDAO.obtenerProductoPorId(id);

    // Si no existe el producto, devolvemos un error 404
    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    // Renderizamos el formulario de edición pre-rellenado con los datos del producto
    res.render("productos/editar", { producto, title: "Editar Producto" });
  } catch (error) {
    console.error("Error al editar el producto: ", error);
    res.status(500).send("Error al editar el producto");
  }
});

// RUTA: Procesar el formulario de edición de producto
// POST /productos/:id/editar
app.post("/productos/:id/editar", async (req, res) => {
  try {
    // Obtenemos el ID del producto a actualizar
    const id = Number(req.params.id);
    // Extraemos los nuevos datos del formulario
    const { nombre, precio, stock } = req.body;
    // Actualizamos el producto en la base de datos con los nuevos valores
    await pDAO.actualizarProducto(id, {
      nombre,
      precio: Number(precio),
      stock: Number(stock),
    });
    // Redirigimos al listado para ver los cambios aplicados
    res.redirect("/productos");
  } catch (error) {
    console.error("Error al editar el producto: ", error);
    res.status(500).send("Error al editar el producto");
  }
});

// RUTA: Eliminar un producto
// POST /productos/:id/borrar
app.post("/productos/:id/borrar", async (req, res) => {
  try {
    // Obtenemos el ID del producto a eliminar
    const id = Number(req.params.id);
    // Eliminamos el producto de la base de datos
    await pDAO.borrarProducto(id);
    // Redirigimos al listado actualizado sin el producto eliminado
    res.redirect("/productos");
  } catch (error) {
    console.error("Error al eliminar el producto: ", error);
    res.status(500).send("Error al eliminar el producto");
  }
});

// ---------------------------
// INICIAR SERVIDOR
// ---------------------------
// Ponemos el servidor a escuchar en el puerto especificado
// Una vez iniciado, ejecuta la función callback que muestra un mensaje en consola
app.listen(PORT, () => {
  console.log(`Servidor web escuchando en http://localhost:${PORT}`);
});
