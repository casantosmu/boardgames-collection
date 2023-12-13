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
export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

interface LogData {
  sql: string;
  parameters: readonly unknown[];
}

interface Options {
  logger: (data: LogData) => void;
}

export type KyselyInstance = Kysely<DB>;

export const createKyselyInstance = (
  connectionString: string,
  options: Options,
): KyselyInstance =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString,
      }),
    }),
    plugins: [new CamelCasePlugin()],
    log(event) {
      if (event.level === "query") {
        options.logger({
          sql: event.query.sql,
          parameters: event.query.parameters,
        });
      }
    },
  });
