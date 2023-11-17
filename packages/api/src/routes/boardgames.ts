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
        querystring: boardgames.querystring,
        response: {
          200: boardgames.response[200],
        },
      },
    },
    async (request) => {
      const boardgames = await fastify.kysely
        .selectFrom("boardgames")
        .select([
          "boardgameId",
          "rate",
          "boardgameName",
          "yearPublished",
          "description",
          "shortDescription",
          "complexity",
          "minAge",
          "minPlayers",
          "maxPlayers",
          "minDuration",
          "maxDuration",
        ])
        .limit(request.query.limit)
        .offset(request.query.offset)
        .execute();

      return {
        data: boardgames.map(
          ({
            boardgameId,
            rate,
            boardgameName,
            yearPublished,
            description,
            shortDescription,
            complexity,
            minAge,
            minPlayers,
            maxPlayers,
            minDuration,
            maxDuration,
          }) => ({
            id: boardgameId,
            rate,
            name: boardgameName,
            yearPublished,
            images: {
              original: `/static/images/boardgame-${boardgameId}-original.webp`,
              "96x96": `/static/images/boardgame-${boardgameId}-96x96.webp`,
            },
            description,
            shortDescription,
            complexity,
            minAge,
            players: {
              min: minPlayers,
              max: maxPlayers,
            },
            duration: {
              min: minDuration,
              max: maxDuration,
            },
          }),
        ),
      };
    },
  );
};
