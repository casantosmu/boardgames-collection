import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";

const pluginCb: FastifyPluginAsync<{ prefix: string }> = async (
  fastify,
  { prefix },
) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Boardgames collection",
        version: "0.1.0",
      },
      tags: [{ name: "ping", description: "Ping end-points" }],
    },
  });
  await fastify.register(fastifySwaggerUi, { prefix });
};

export const openapiPlugin = fp(pluginCb);
