import type { FastifyPluginAsync } from "fastify";
import { sql } from "db-main-kysely";
import { DtosV1 } from "common";

export const pingRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    "/ping",
    {
      schema: {
        summary: "Ping the server to check its availability",
        tags: ["ping"],
        response: {
          204: {
            type: "null",
            description: "Success",
          },
          500: DtosV1.Errors[500],
        },
      },
    },
    async (request, reply) => {
      await sql`SELECT 1+1`.execute(fastify.kysely);
      return reply.code(204).send();
    },
  );
};
