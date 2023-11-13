import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { promises as fs } from "node:fs";
import pg from "pg";
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from "kysely";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationFolder = path.join(__dirname, "..", "/migrations");

const db = new Kysely({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: process.env["DATABASE_URL"],
    }),
  }),
});

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder,
  }),
});

const { error, results } = await migrator.migrateToLatest();

results?.forEach((it) => {
  if (it.status === "Success") {
    console.log(`migration "${it.migrationName}" was executed successfully`);
  } else if (it.status === "Error") {
    console.error(`failed to execute migration "${it.migrationName}"`);
  }
});

if (error) {
  console.error("failed to migrate");
  console.error(error);
  process.exit(1);
}

await db.destroy();
