class Producto {
  // constructor con los atributos que tendra esa clase
  constructor(nombre, precio, stock) {
    //el parametro this se refiere al objeto actual que está siendo creado o manipulado.
    //Dentro de un método de la clase, this permite acceder a las propiedades y métodos del objeto instanciado.
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
  }

  //metodo para calcular el iva con un parametro
  calcularIVA(porcentajeIva) {
    const iva = this.precio * porcentajeIva;
    return iva;
  }

  //metodo para mostrar info
  mostrarInfo() {
    console.log(
      `Producto: ${this.nombre}. Precio: ${this.precio}€. Stock: ${this.stock}. IVA: ${this.calcularIVA(0.21)}€`,
    );
  }
}
// exportamos la clase para que pueda ser usada en otros archivos
module.exports = Producto;
