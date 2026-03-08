const Producto = require("./clases/Producto");
const ProductoDigital = require("./clases/ProductoDigital");
const pDAO = require("./model/ProductosDAO");

const main = async () => {
  try {
    const libro = new Producto("Libro fisico", 19, 578);
    const ebook = new ProductoDigital("Libro digital", 10, 999, 120);

    console.log("libro: ", libro);
    console.log("libro digital: ", ebook);

    //vamos a insertar usando las funciones del DAO
    const libroDB = await pDAO.insertarProducto(libro);
    console.log("libro insertado en DB: ", libroDB);
    const ebookDB = await pDAO.insertarProductoDigital(ebook);
    console.log("ebook insertado en DB: ", ebookDB);
  } catch (error) {
    console.error(`Error al conectar con la BBDD: ${error}`);
  }
};

main();
