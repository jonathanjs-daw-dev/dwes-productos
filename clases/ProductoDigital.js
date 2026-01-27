//herencia - ProductoDigital hereda de Producto.
const Producto = require("./Producto");
// ProductoDigital extiende de Producto
class ProductoDigital extends Producto {
  constructor(nombre, precio, stock, tamDescarga) {
    super(nombre, precio, stock);
    this.tamDescarga = tamDescarga;
  }

  mostrarInfo() {
    super.mostrarInfo();
    console.log(`Tamaño de Descarga: ${this.tamDescarga} MB.`);
  }
}

module.exports = ProductoDigital;
