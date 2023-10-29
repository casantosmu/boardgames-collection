import {
  CamelCasePlugin,
  Kysely,
  PostgresDialect,
  sql,
  type RawBuilder,
  type SelectQueryBuilder,
} from "kysely";
import pg from "pg";
import type { DB } from "./generated/db.js";

export { sql } from "kysely";
export type { PoolConfig } from "pg";
export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

interface Options {
  logger: (metadata: unknown) => void;
}

export type KyselyInstance = Kysely<DB>;

export const createKyselyInstance = (
  config: pg.PoolConfig,
  options: Options,
): KyselyInstance =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool(config),
    }),
    plugins: [new CamelCasePlugin()],
    log: options.logger,
  });

export const arrayFromColumn = <T, A>(
  query: SelectQueryBuilder<DB & A, keyof A, { col: T }>,
): RawBuilder<T[]> =>
  sql`(SELECT coalesce(array_agg(col), '{}') FROM (${query}) as subquery)`;
