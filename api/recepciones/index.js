import {
  getPool,
  filtrarColumnasPermitidas,
  prepararValor,
} from "../_db.js";
import { requireAuth } from "../_auth.js";

export default async function handler(req, res) {
  const usuario = await requireAuth(req, res);
  if (!usuario) {
    return;
  }

  const pool = getPool();

  if (req.method === "GET") {
    const { rows } = await pool.query(
      "select * from recepciones order by id desc",
    );
    res.status(200).json(rows);
    return;
  }

  if (req.method === "POST") {
    const filas = Array.isArray(req.body) ? req.body : [req.body];
    const insertadas = [];

    for (const fila of filas) {
      const datos = filtrarColumnasPermitidas(fila);
      const columnas = Object.keys(datos);
      const valores = Object.values(datos).map(prepararValor);

      if (columnas.length === 0) {
        continue;
      }

      const placeholders = columnas.map((_, i) => `$${i + 1}`).join(", ");
      const { rows } = await pool.query(
        `insert into recepciones (${columnas.join(", ")}) values (${placeholders}) returning *`,
        valores,
      );
      insertadas.push(rows[0]);
    }

    res.status(201).json(insertadas);
    return;
  }

  res.status(405).json({ message: "Método no permitido" });
}
