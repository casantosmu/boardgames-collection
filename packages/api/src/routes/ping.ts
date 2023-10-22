import {
  Type,
  type FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";
import { sql } from "db-main-kysely";

// eslint-disable-next-line @typescript-eslint/require-await
export const pingRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.post(
    "/ping",
    {
      schema: {
        description: "Ping the server to check its availability",
        tags: ["ping"],
        response: {
          200: Type.Object(
            {
              message: Type.String(),
            },
            {
              description: "Success",
            },
          ),
        },
      },
    },
    async () => {
      await sql`SELECT 1+1`.execute(fastify.kysely);
      return { message: "OK" };
    },
  );
};
