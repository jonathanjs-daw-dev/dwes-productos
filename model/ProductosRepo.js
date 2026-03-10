/**
 * ARCHIVO: ProductosRepo.js
 *
 * Este archivo implementa el patrón "Repository" o "Adapter".
 * ¿Qué es? Es un intermediario que decide cuál implementación usar (DAO u ORM)
 * sin que el resto del código tenga que saber cuál está usando.
 *
 * VENTAJA: Si mañana quieres cambiar de DAO a ORM (o viceversa), solo cambias
 * una variable de entorno. El resto del código sigue funcionando igual.
 */

// Leemos la variable de entorno DATA_LAYER
// Si no existe, usamos "DAO" como valor por defecto
// .toUpperCase() convierte el valor a mayúsculas (por si alguien escribe "dao" o "orm")
const modo = (process.env.DATA_LAYER || "DAO").toUpperCase();

// Exportamos el módulo correspondiente según el modo elegido
// Si modo === "ORM", exportamos ProductosORM.js
// Si no, exportamos ProductosDAO.js (el valor por defecto)
// Esto significa que cuando otro archivo haga require("./ProductosRepo"),
// obtendrá automáticamente la implementación correcta
module.exports =
  modo === "ORM" ? require("./ProductosORM") : require("./ProductosDAO");
