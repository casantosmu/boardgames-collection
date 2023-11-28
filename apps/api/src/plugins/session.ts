import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Redis } from "ioredis";
import RedisStore from "connect-redis";
import { fastifyCookie } from "@fastify/cookie";
import { fastifySession } from "@fastify/session";
import { openApiInfo } from "dtos/v1";

declare module "fastify" {
  interface Session {
    authenticated?: boolean;
  }
}

const pluginCb: FastifyPluginAsync<{
  secret: string;
  secure: boolean;
}> = async (fastify, options) => {
  const ioRedis = new Redis({
    enableAutoPipelining: true,
    lazyConnect: true,
  });

  try {
    fastify.log.info("Starting Redis connection...");
    await ioRedis.connect();
    fastify.log.info("Redis is ready");
  } catch (error) {
    throw new Error("Redis connection error", { cause: error });
  }

  fastify.addHook("onClose", async () => {
    await ioRedis.quit();
    fastify.log.info("Redis shut down");
  });

  await fastify.register(fastifyCookie);
  await fastify.register(fastifySession, {
    secret: options.secret,
    cookieName: openApiInfo.components.securitySchemes.cookieAuth.name,
    cookie: { secure: options.secure },
    store: new RedisStore({
      client: ioRedis,
    }),
  });
};

export const sessionPlugin = fp(pluginCb);
