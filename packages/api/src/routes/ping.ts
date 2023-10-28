import type { FastifyPluginAsync } from "fastify";
import { sql } from "db-main-kysely";

// eslint-disable-next-line @typescript-eslint/require-await
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
    async (response, request) => {
      await sql`SELECT 1+1`.execute(fastify.kysely);
      return request.code(204).send();
    },
  );
};
