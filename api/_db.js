import pg from "pg";

let pool;

export function getPool() {
  if (!pool) {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export const COLUMNAS_RECEPCION = [
  "numero_formulario",
  "fecha_ingreso",
  "cliente",
  "direccion",
  "cuit",
  "telefono",
  "email",
  "adjunta_factura",
  "fecha_factura",
  "numero_factura",
  "garantia",
  "periodo_garantia",
  "diagnostico_costo",
  "condiciones_diagnostico",
  "observaciones",
  "segmento",
  "equipo",
  "modelo_codigo",
  "numero_serie",
  "accesorios",
  "falla_denunciada",
  "estado_general",
  "estado_taller",
  "tareas",
];

export const filtrarColumnasPermitidas = (objeto = {}) =>
  Object.fromEntries(
    Object.entries(objeto).filter(([clave]) => COLUMNAS_RECEPCION.includes(clave)),
  );

export const prepararValor = (valor) =>
  typeof valor === "object" && valor !== null ? JSON.stringify(valor) : valor;
