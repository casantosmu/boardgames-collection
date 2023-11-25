import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { jsonArrayFrom } from "db-main-kysely";
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
          .selectFrom("boardgames as b")
          .select((eb) => [
            "b.boardgameId as id",
            "b.rate",
            "b.boardgameName as name",
            "b.yearPublished",
            "b.description",
            "b.shortDescription",
            "b.complexity",
            "b.minAge",
            "b.minPlayers",
            "b.maxPlayers",
            "b.minDuration",
            "b.maxDuration",
            jsonArrayFrom(
              eb
                .selectFrom("bestPlayers as bp")
                .select(["bp.minPlayers as min", "bp.maxPlayers as max"])
                .whereRef("bp.boardgameId", "=", "b.boardgameId")
                .orderBy("b.minPlayers"),
            ).as("bestPlayers"),
          ]);

        if (request.query.search !== undefined) {
          query = query.where(
            "b.boardgameName",
            "ilike",
            `%${request.query.search}%`,
          );
        }

        if (
          request.query.minPlayers !== undefined ||
          request.query.maxPlayers !== undefined
        ) {
          query = query.where((eb) => {
            const ands = [];
            if (request.query.minPlayers !== undefined) {
              ands.push(eb("b.minPlayers", "<=", request.query.minPlayers));
            }
            if (request.query.maxPlayers !== undefined) {
              ands.push(eb("b.maxPlayers", ">=", request.query.maxPlayers));
            }
            return eb.and(ands);
          });
        }

        if (
          request.query.minBestPlayers !== undefined ||
          request.query.maxBestPlayers !== undefined
        ) {
          query = query.where(({ exists, selectFrom }) =>
            exists(
              selectFrom("bestPlayers as bp")
                .selectAll()
                .whereRef("bp.boardgameId", "=", "b.boardgameId")
                .where((eb) => {
                  const ands = [];
                  if (request.query.minBestPlayers !== undefined) {
                    ands.push(
                      eb("bp.minPlayers", "<=", request.query.minBestPlayers),
                    );
                  }
                  if (request.query.maxBestPlayers !== undefined) {
                    ands.push(
                      eb("bp.maxPlayers", ">=", request.query.maxBestPlayers),
                    );
                  }
                  return eb.and(ands);
                }),
            ),
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
              id,
              rate,
              name,
              yearPublished,
              description,
              shortDescription,
              complexity,
              minAge,
              minPlayers,
              maxPlayers,
              minDuration,
              maxDuration,
              bestPlayers,
            }) => ({
              id,
              rate,
              name,
              yearPublished,
              images: {
                original: `/static/images/boardgame-${id}-original.webp`,
                "96x96": `/static/images/boardgame-${id}-96x96.webp`,
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
              bestPlayers,
            }),
          ),
        };
      });
    },
  );
};
