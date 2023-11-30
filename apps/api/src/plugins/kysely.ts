import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { createKyselyInstance, sql, type KyselyInstance } from "db-main-kysely";

declare module "fastify" {
  interface FastifyInstance {
    kysely: KyselyInstance;
  }
}

interface Options {
  url: string;
}

const pluginCb: FastifyPluginAsync<Options> = async (fastify, options) => {
  const kysely = createKyselyInstance(options.url, {
    logger(data) {
      fastify.log.debug(data);
    },
  });

  try {
    fastify.log.info("Starting PostgreSQL connection...");
    await sql`SELECT 1+1`.execute(kysely);
    fastify.log.info("Postgres is ready");
  } catch (error) {
    throw new Error("Postgres connection error", { cause: error });
  }

  fastify.decorate("kysely", kysely);
  fastify.addHook("onClose", async () => {
    await kysely.destroy();
    fastify.log.info("Postgres shut down");
  });
};

export const kyselyPlugin = fp(pluginCb);
