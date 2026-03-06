const Producto = require("./clases/Producto");
const ProductoDigital = require("./clases/ProductoDigital");

const fs = require("fs/promises");
const fsCb = require("fs");

const DATA_DIR = "./data"; //directorio donde vamos a almacenar los datos, colgando de la raiz.
const DATA_FILE = `${DATA_DIR}/productos.json`; //apuntador a donde queremos que se guarde el archivo de datos, el fichero de datos
const LOG_FILE = `${DATA_DIR}/log.txt`; //fichero de logs, para que todo lo que hagamos se quede registrado, errores y demas.

const libro = new Producto("Libro 1", 9.99, 100);
const ebook = new ProductoDigital("Libro 1", 9.99, 200, 45.12);

const productos = [libro, ebook];

//vamos a construir una estructura json para despues escribirla en un fichero.
const productosJSON = JSON.stringify(productos, null, 2);
console.log("json generado::::", productosJSON);

libro.mostrarInfo();
ebook.mostrarInfo();

async function trabajoConFicheros() {
  try {
    //crear una carpeta data
    await fs.mkdir(DATA_DIR, {
      recursive: true, //le decimos que si ya existe, que no haga nada, se quede como esta y adelante.
    }); //crea un nuevo directorio data si no existe
    console.log(`Carpeta ${DATA_DIR} lista`);

    //escribir en la carpeta el fichero json
    await fs.writeFile(DATA_FILE, productosJSON, "utf-8"); //donde quiero que se escriba, lo que quiero escribir, formato caracteres occidentales
    console.log(`Fichero ${DATA_FILE} guardado`);

    //leer fichero json
    const contenido = await fs.readFile(DATA_FILE, "utf-8");
    console.log(`Contenido del fichero ${contenido}`);
    //json parser para poder trabajar con esos obj dentro de la app.
    const productosLeidos = JSON.parse(contenido);
    console.log("Contenido del fichero parseado:", productosLeidos);

    //borrar ficheros
    //fichero temporal
    //creamos el fichero temporal
    const TEMP_FILE = `${DATA_DIR}/temp.txt`;
    await fs.writeFile(TEMP_FILE, "Hola Manola", "utf-8");
    console.log(`El fichero ${TEMP_FILE} existe en este punto`);
    await fs.unlink(TEMP_FILE); //esto va a borrar tambien
    console.log(`El fichero ${TEMP_FILE} YA NO existe en este punto`);
  } catch (error) {
    console.error("Error trabajando con ficheros: ", error);
  }
}

trabajoConFicheros();
