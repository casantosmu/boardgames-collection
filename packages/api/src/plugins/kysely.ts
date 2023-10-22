import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

import {
  createKyselyInstance,
  sql,
  type KyselyInstance,
  type PoolConfig,
} from "db-main-kysely";

declare module "fastify" {
  interface FastifyInstance {
    kysely: KyselyInstance;
  }
}

const pluginCb: FastifyPluginAsync<PoolConfig> = async (fastify, options) => {
  const kysely = createKyselyInstance(options);

  fastify.decorate("kysely", kysely);

  fastify.addHook("onClose", async () => {
    await kysely.destroy();
    fastify.log.info("Postgres shut down");
  });

  try {
    fastify.log.info("Starting PostgreSQL");
    await sql`SELECT 1+1`.execute(fastify.kysely);
    fastify.log.info("Postgres is ready");
  } catch (error) {
    throw new Error("Postgres connection error", { cause: error });
  }
};

export const kyselyPlugin = fp(pluginCb);
