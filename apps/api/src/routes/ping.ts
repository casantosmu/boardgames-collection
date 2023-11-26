import type { FastifyPluginAsync } from "fastify";
import { sql } from "db-main-kysely";

export const pingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/ping",
    {
      schema: {
        description: "Ping the server to check its availability",
        tags: ["ping"],
        response: {
          204: {
            type: "null",
            description: "Success",
          },
        },
      },
    },
    async (request, reply) => {
      await sql`SELECT 1+1`.execute(fastify.kysely);
      return reply.code(204).send();
    },
  );
};
