import type { FastifyPluginAsync } from "fastify";
import type pg from "pg-promise/typescript/pg-subset.js";
import fp from "fastify-plugin";
import pgp from "pg-promise";

declare module "fastify" {
  interface FastifyInstance {
    pg: pgp.IDatabase<unknown>;
  }
}

interface Options {
  options?: pgp.IInitOptions;
  connection: string | pg.IConnectionParameters;
}

const pluginCb: FastifyPluginAsync<Options> = async (fastify, options) => {
  const pg = pgp(options.options)(options.connection);

  fastify.decorate("pg", pg);

  fastify.addHook("onClose", async () => {
    await pg.$pool.end();
    fastify.log.info("Postgres shut down");
  });

  try {
    fastify.log.info("Starting PostgreSQL");
    await pg.query("SELECT 1+1");
    fastify.log.info("Postgres is ready");
  } catch (error) {
    throw new Error("Postgres connection error", { cause: error });
  }
};

export const pgPlugin = fp(pluginCb);
