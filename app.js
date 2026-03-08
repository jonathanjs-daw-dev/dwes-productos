const express = require("express");
const path = require("path");
const pDAO = require("./model/ProductosDAO");

const app = express();
const PORT = 3000;

// Motor de vistas EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Para leer datos de formularios (POST)
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// ---------------------------
// RUTA: LISTAR PRODUCTOS
// ---------------------------
app.get("/productos", async (req, res) => {
  try {
    const productos = await pDAO.obtenerTodos();
    res.render("productos/lista", { productos });
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).send("Error al obtener productos");
  }
});

// ---------------------------
// INICIO SIMPLE
// ---------------------------
app.get("/", (req, res) => {
  res.redirect("/productos");
});

app.get("/productos/nuevo", (req, res) => {
  res.render("productos/nuevo");
});

app.post("/productos", async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    const producto = { nombre, precio: Number(precio), stock: Number(stock) };
    await pDAO.insertarProducto(producto);
    res.redirect("/productos");
  } catch (error) {
    console.error("Error al crear el producto: ", error);
    res.status(500).send("Error al crear el producto");
  }
});

app.get("/productos/:id/editar", async (req, res) => {
  try {
    const id = Number(req.params.id);
    //consulta a lanzar para obtener el producto por id actualizado
    const producto = await pDAO.obtenerProductoPorId(id);

    if (!producto) {
      return res.status(404).send("Producto no encontrado");
    }

    res.render("productos/editar", { producto });
  } catch (error) {
    console.error("Error al editar el producto: ", error);
    res.status(500).send("Error al editar el producto");
  }
});

app.post("/productos/:id/editar", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, precio, stock } = req.body;
    await pDAO.actualizarProducto(id, {
      nombre,
      precio: Number(precio),
      stock: Number(stock),
    });
    res.redirect("/productos");
  } catch (error) {
    console.error("Error al editar el producto: ", error);
    res.status(500).send("Error al editar el producto");
  }
});

app.post("/productos/:id/borrar", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pDAO.borrarProducto(id);
    res.redirect("/productos");
  } catch (error) {
    console.error("Error al eliminar el producto: ", error);
    res.status(500).send("Error al eliminar el producto");
  }
});

// ---------------------------
// LANZAR SERVIDOR
// ---------------------------
app.listen(PORT, () => {
  console.log(`Servidor web escuchando en http://localhost:${PORT}`);
});
