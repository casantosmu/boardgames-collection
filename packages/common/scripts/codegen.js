import path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const folderPath = path.join(__dirname, "..", "generated");
  const client = new pg.Client({ connectionString: process.env["PG_URL"] });

  await fs.mkdir(folderPath, { recursive: true });
  await client.connect();

  const [types, categories, mechanisms] = await Promise.all([
    client.query(
      "SELECT t.type_id as id, t.type_name as name FROM types as t ORDER BY t.type_name",
    ),
    client.query(
      "SELECT c.category_id as id, c.category_name as name FROM categories as c ORDER BY c.category_name",
    ),
    client.query(
      "SELECT m.mechanism_id as id, m.mechanism_name as name FROM mechanisms as m ORDER BY m.mechanism_name",
    ),
  ]);

  const data = JSON.stringify({
    types: types.rows,
    categories: categories.rows,
    mechanisms: mechanisms.rows,
  });
  const filePath = path.join(folderPath, "classifications.json");

  await fs.writeFile(filePath, data, { encoding: "utf8" });
  await client.end();

  console.log(`Codegen was executed successfully`);
} catch (error) {
  console.error("Codegen failed");
  console.error(error);
  process.exit(1);
}
