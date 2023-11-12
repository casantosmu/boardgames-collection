import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { boardgames } from "dtos/v1";

// eslint-disable-next-line @typescript-eslint/require-await
export const boardgamesRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    "/boardgames",
    {
      schema: {
        description: "Get a list of boardgames in the collection",
        tags: ["boardgames"],
        response: {
          200: boardgames.response[200],
        },
      },
    },
    async () => {
      return {
        data: await fastify.kysely
          .selectFrom("boardgames")
          .select([
            "boardgameId as id",
            "rate",
            "boardgameName as name",
            "yearPublished",
            "imagePath",
            "description",
            "shortDescription",
            "complexity",
            "minAge",
            "minPlayers",
            "maxPlayers",
            "minDuration",
            "maxDuration",
          ])
          .limit(10)
          .execute(),
      };
    },
  );
};
