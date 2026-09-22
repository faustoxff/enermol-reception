import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(path.join(__dirname, "schema.sql"), "utf8");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();
await client.query(sql);
await client.end();

console.log("Tabla 'recepciones' creada/verificada.");
