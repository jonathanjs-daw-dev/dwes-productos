# dwes-productos

Proyecto de ejemplo sobre **Programación Orientada a Objetos (POO)** en JavaScript.

## Descripción

Este proyecto demuestra los conceptos fundamentales de POO mediante un sistema de gestión de productos:

- **Clases y objetos**: Creación de clases `Producto`, `ProductoDigital`, `ProductoFisico`
- **Encapsulamiento**: Uso de propiedades privadas y métodos getter/setter
- **Herencia**: Clases hijas que extienden la funcionalidad de la clase base
- **Polimorfismo**: Métodos que se comportan de forma diferente según el tipo de producto

## Estructura del proyecto

```
dwes-productos/
├── clases/
│   ├── Producto.js          # Clase base
│   ├── ProductoDigital.js   # Hereda de Producto
│   └── ProductoFisico.js    # Hereda de Producto
└── index.js                 # Punto de entrada
```

## Conceptos de POO aplicados

| Concepto | Ejemplo en el proyecto |
|----------|------------------------|
| Clase | `class Producto { }` |
| Constructor | `constructor(nombre, precio)` |
| Herencia | `class ProductoDigital extends Producto` |
| Métodos | `calcularPrecioFinal()` |

## Uso

```javascript
const producto = new ProductoDigital("Curso JavaScript", 29.99, "1.5GB");
console.log(producto.calcularPrecioFinal());
```

## Tecnologías

- JavaScript ES6+
- Node.js
