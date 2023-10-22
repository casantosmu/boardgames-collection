import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import type { DB } from "./generated/db.js";
import pg from "pg";
export { sql } from "kysely";
export type { PoolConfig } from "pg";

export type KyselyInstance = Kysely<DB>;

export const createKyselyInstance = (config: pg.PoolConfig) =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool(config),
    }),
    plugins: [new CamelCasePlugin()],
  });
