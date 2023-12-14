import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { DB } from "kysely-codegen";

export { sql } from "kysely";
export { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

interface LogData {
  sql: string;
  parameters: readonly unknown[];
}

interface Options {
  logger?: (data: LogData) => void;
}

export type KyselyInstance = Kysely<DB>;

export const createKyselyInstance = (
  connectionString: string,
  options?: Options,
): KyselyInstance => {
  const { logger } = options ?? {};

  return new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString,
      }),
    }),
    plugins: [new CamelCasePlugin()],
    ...(logger && {
      log(event) {
        if (event.level === "query") {
          logger({
            sql: event.query.sql,
            parameters: event.query.parameters,
          });
        }
      },
    }),
  });
};
