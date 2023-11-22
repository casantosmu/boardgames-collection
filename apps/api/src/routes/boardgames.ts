import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { boardgames } from "dtos/v1";

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
      return fastify.kysely.transaction().execute(async (trx) => {
        let query = trx
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
          ]);

        if (request.query.search) {
          query = query.where(
            "boardgameName",
            "ilike",
            `%${request.query.search}%`,
          );
        }

        const [data, metadata] = await Promise.all([
          query
            .limit(request.query.rowsPerPage)
            .offset(request.query.page * request.query.rowsPerPage)
            .execute(),
          query
            .clearSelect()
            .select((eb) => eb.fn.countAll<number>().as("count"))
            .executeTakeFirstOrThrow(),
        ]);

        return {
          metadata: {
            count: metadata.count,
          },
          data: data.map(
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
      });
    },
  );
};
