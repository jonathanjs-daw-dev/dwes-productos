# dwes-productos

Aplicación web educativa de **gestión de productos** que demuestra conceptos avanzados de arquitectura de software, patrones de diseño y acceso a datos en Node.js.

## 📋 Descripción

Este proyecto es un sistema CRUD completo para gestionar productos (físicos y digitales) con una arquitectura flexible que permite cambiar entre dos implementaciones de acceso a datos sin modificar el código de la aplicación.

**Objetivo educativo**: Aprender cómo diseñar aplicaciones escalables usando patrones de diseño, separación de capas y buenas prácticas de desarrollo.

---

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura de capas** con separación clara de responsabilidades:

```
┌─────────────────────────────────────┐
│         Capa de Presentación        │
│  (Views EJS + Express Routes)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Capa de Lógica de Negocio      │
│    (app.js - Rutas y Controladores) │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Capa de Abstracción (Repository) │
│  (ProductosRepo.js - Patrón Facade) │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼────────┐  ┌────▼──────────┐
│  DAO Layer    │  │  ORM Layer    │
│ (SQL puro)    │  │  (Prisma)     │
└──────┬────────┘  └────┬──────────┘
       │                │
       └────────┬───────┘
              │
       ┌──────▼──────────┐
       │  PostgreSQL DB  │
       └─────────────────┘
```

---

## 📁 Estructura del Proyecto

```
dwes-productos/
├── app.js                          # Punto de entrada, rutas Express
├── .env                            # Variables de entorno (DATA_LAYER, BD)
├── package.json                    # Dependencias del proyecto
│
├── clases/                         # Clases de dominio (POO)
│   ├── Producto.js                 # Clase base
│   └── ProductoDigital.js          # Hereda de Producto
│
├── model/                          # Capa de acceso a datos
│   ├── ProductosRepo.js            # Patrón Repository (selector DAO/ORM)
│   ├── ProductosDAO.js             # Implementación con SQL puro
│   └── ProductosORM.js             # Implementación con Prisma
│
├── db/                             # Configuración de BD
│   └── db.js                       # Pool de conexiones PostgreSQL
│
├── prisma/                         # Configuración de Prisma ORM
│   └── schema.prisma               # Definición de modelos
│
├── views/                          # Plantillas EJS
│   ├── layout.ejs                  # Layout base
│   └── productos/
│       ├── lista.ejs               # Listado de productos
│       ├── nuevo.ejs               # Formulario crear
│       └── editar.ejs              # Formulario editar
│
└── public/                         # Archivos estáticos
    └── css/
        └── style.css               # Estilos
```

---

## 🎓 Conceptos Aprendidos

### 1. **Programación Orientada a Objetos (POO)**
- **Clases y objetos**: `Producto`, `ProductoDigital`
- **Herencia**: `ProductoDigital extends Producto`
- **Encapsulamiento**: Propiedades privadas y métodos getter/setter
- **Polimorfismo**: Métodos que se comportan diferente según el tipo

### 2. **Patrones de Diseño**

#### **Patrón DAO (Data Access Object)**
- Acceso directo a BD con SQL puro
- Mayor control, más código
- Archivo: `ProductosDAO.js`

#### **Patrón ORM (Object-Relational Mapping)**
- Abstracción de la BD con Prisma
- Menos código, menos control
- Archivo: `ProductosORM.js`

#### **Patrón Repository**
- Abstracción sobre DAO/ORM
- Permite cambiar entre implementaciones sin afectar el resto del código
- Archivo: `ProductosRepo.js`

#### **Patrón Facade**
- Interfaz simplificada que delega a un objeto más complejo
- Usado en `ProductosRepo.js` para exponer funciones uniformes

### 3. **Arquitectura de Capas**
- **Capa de Presentación**: Vistas EJS + rutas Express
- **Capa de Lógica**: Controladores en `app.js`
- **Capa de Abstracción**: Repository pattern
- **Capa de Datos**: DAO o ORM

### 4. **Gestión de Variables de Entorno**
- Uso de `dotenv` para cargar `.env`
- Variable `DATA_LAYER` para elegir entre DAO u ORM
- Importancia de cargar variables **antes** de importar módulos

### 5. **CRUD Completo**
- **Create**: Crear productos (físicos y digitales)
- **Read**: Listar y obtener por ID
- **Update**: Editar nombre, precio, stock y tamaño de descarga
- **Delete**: Eliminar productos

### 6. **Relaciones en BD**
- Relación 1:N entre `productos` y `productos_digitales`
- Uso de foreign keys y CASCADE DELETE
- Consultas con LEFT JOIN

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Propósito |
|-----------|-----------|
| **Node.js** | Runtime de JavaScript en servidor |
| **Express.js** | Framework web para rutas y middlewares |
| **EJS** | Motor de plantillas para vistas |
| **PostgreSQL** | Base de datos relacional |
| **Prisma** | ORM para acceso a BD |
| **dotenv** | Gestión de variables de entorno |
| **pg** | Driver nativo de PostgreSQL |

---

## 🚀 Configuración y Uso

### Requisitos
- Node.js v14+
- PostgreSQL instalado y ejecutándose
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd dwes-productos

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de BD
```

### Variables de Entorno (.env)

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=productos
DB_USER=admin
DB_PASSWORD=12345

# Capa de datos (DAO o ORM)
DATA_LAYER=ORM

# Conexión Prisma
DATABASE_URL="postgresql://admin:12345@localhost:5432/productos?schema=public"
```

### Ejecutar la Aplicación

```bash
# Con DAO
DATA_LAYER=DAO node app.js

# Con ORM (por defecto)
DATA_LAYER=ORM node app.js

# O simplemente (usa el valor de .env)
node app.js
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📚 Funcionalidades

- ✅ Listar todos los productos
- ✅ Ver detalles de un producto
- ✅ Crear producto físico
- ✅ Crear producto digital (con tamaño de descarga)
- ✅ Editar producto (nombre, precio, stock)
- ✅ Editar tamaño de descarga (solo productos digitales)
- ✅ Eliminar producto
- ✅ Cambiar entre DAO y ORM sin modificar código

---

## 💡 Lecciones Clave

1. **Separación de responsabilidades**: Cada capa tiene un propósito claro
2. **Flexibilidad**: El patrón Repository permite cambiar implementaciones fácilmente
3. **Documentación**: Comentarios educativos en todo el código
4. **Variables de entorno**: Configuración sin hardcodear valores
5. **Relaciones en BD**: Cómo modelar datos complejos
6. **CRUD completo**: Implementación de todas las operaciones básicas

---

## 📖 Recursos Educativos

Este proyecto es ideal para aprender:
- Cómo estructurar una aplicación Node.js
- Diferencias entre DAO y ORM
- Patrones de diseño en JavaScript
- Acceso a bases de datos relacionales
- Buenas prácticas de desarrollo

---

## 📝 Notas

- El código incluye comentarios educativos explicando cada línea
- Perfecto para estudiantes de desarrollo web backend
- Puede extenderse con autenticación, validaciones, etc.

---

**Autor**: Proyecto educativo
**Licencia**: MIT
