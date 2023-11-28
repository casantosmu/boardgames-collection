import type { FastifyPluginAsync } from "fastify";
import { sql } from "db-main-kysely";
import { ping } from "dtos/v1";

export const pingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/ping", { schema: ping }, async (request, reply) => {
    await sql`SELECT 1+1`.execute(fastify.kysely);
    return reply.code(204).send();
  });
};
