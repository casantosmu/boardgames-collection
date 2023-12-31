import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Redis } from "ioredis";
import RedisStore from "connect-redis";
import { fastifyCookie } from "@fastify/cookie";
import { fastifySession } from "@fastify/session";

declare module "fastify" {
  interface Session {
    user?: {
      id: number;
      email: string;
    };
  }
}

interface Options {
  secret: string;
  secure: boolean;
  cookieName: string;
}

const pluginCallback: FastifyPluginAsync<Options> = async (
  fastify,
  options,
) => {
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
    cookieName: options.cookieName,
    cookie: { secure: options.secure },
    store: new RedisStore({ client: ioRedis }),
  });
};

export const sessionPlugin = fp(pluginCallback);
