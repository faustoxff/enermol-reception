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
  const id = Number(req.query.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Id inválido" });
    return;
  }

  if (req.method === "GET") {
    const { rows } = await pool.query(
      "select * from recepciones where id = $1",
      [id],
    );
    res.status(200).json(rows[0] ?? null);
    return;
  }

  if (req.method === "PATCH") {
    const datos = filtrarColumnasPermitidas(req.body);
    const columnas = Object.keys(datos);

    if (columnas.length === 0) {
      const { rows } = await pool.query(
        "select * from recepciones where id = $1",
        [id],
      );
      res.status(200).json(rows[0] ?? null);
      return;
    }

    const valores = Object.values(datos).map(prepararValor);
    const sets = columnas.map((col, i) => `${col} = $${i + 1}`).join(", ");

    const { rows } = await pool.query(
      `update recepciones set ${sets} where id = $${columnas.length + 1} returning *`,
      [...valores, id],
    );
    res.status(200).json(rows[0] ?? null);
    return;
  }

  if (req.method === "DELETE") {
    await pool.query("delete from recepciones where id = $1", [id]);
    res.status(204).end();
    return;
  }

  res.status(405).json({ message: "Método no permitido" });
}
