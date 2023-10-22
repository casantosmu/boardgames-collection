import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen";
import pg from "pg";
export { sql } from "kysely";
export type { Kysely } from "kysely";
export type { DB } from "kysely-codegen";
export type { PoolConfig } from "pg";

export const createKyselyInstance = (config: pg.PoolConfig) =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool(config),
    }),
    plugins: [new CamelCasePlugin()],
  });
