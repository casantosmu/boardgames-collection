import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { jsonArrayFrom } from "db-main-kysely";
import { errors, getBoardgames } from "common/dtos/v1";

export const boardgamesRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    "/boardgames",
    {
      schema: {
        summary: "Get a list of boardgames in the collection",
        tags: ["boardgames"],
        querystring: getBoardgames.querystring,
        response: {
          200: {
            ...getBoardgames.response[200],
            description: "Success",
          },
          500: errors[500],
        },
      },
    },
    async (request) => {
      const {
        page,
        rowsPerPage,
        search,
        minPlayers,
        maxPlayers,
        minBestPlayers,
        maxBestPlayers,
        types,
        categories,
        mechanisms,
      } = request.query;

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

        if (search !== undefined) {
          query = query.where("b.boardgameName", "ilike", `%${search}%`);
        }

        if (minPlayers !== undefined || maxPlayers !== undefined) {
          query = query.where((eb) => {
            const ands = [];
            if (minPlayers !== undefined) {
              ands.push(eb("b.minPlayers", "<=", minPlayers));
            }
            if (maxPlayers !== undefined) {
              ands.push(eb("b.maxPlayers", ">=", maxPlayers));
            }
            return eb.and(ands);
          });
        }

        if (minBestPlayers !== undefined || maxBestPlayers !== undefined) {
          query = query.where(({ exists, selectFrom }) =>
            exists(
              selectFrom("bestPlayers as bp")
                .whereRef("bp.boardgameId", "=", "b.boardgameId")
                .where((eb) => {
                  const ands = [];
                  if (minBestPlayers !== undefined) {
                    ands.push(eb("bp.minPlayers", "<=", minBestPlayers));
                  }
                  if (maxBestPlayers !== undefined) {
                    ands.push(eb("bp.maxPlayers", ">=", maxBestPlayers));
                  }
                  return eb.and(ands);
                }),
            ),
          );
        }

        if (types !== undefined) {
          query = query.where(({ exists, selectFrom, and }) =>
            and(
              types.map((type) =>
                exists(
                  selectFrom("boardgamesTypes as bt")
                    .whereRef("bt.boardgameId", "=", "b.boardgameId")
                    .where("bt.type", "=", type),
                ),
              ),
            ),
          );
        }

        if (categories !== undefined) {
          query = query.where(({ exists, selectFrom, and }) =>
            and(
              categories.map((category) =>
                exists(
                  selectFrom("boardgamesCategories as bc")
                    .whereRef("bc.boardgameId", "=", "b.boardgameId")
                    .where("bc.category", "=", category),
                ),
              ),
            ),
          );
        }

        if (mechanisms !== undefined) {
          query = query.where(({ exists, selectFrom, and }) =>
            and(
              mechanisms.map((mechanism) =>
                exists(
                  selectFrom("boardgamesMechanisms as bm")
                    .whereRef("bm.boardgameId", "=", "b.boardgameId")
                    .where("bm.mechanism", "=", mechanism),
                ),
              ),
            ),
          );
        }

        const [data, metadata] = await Promise.all([
          query
            .limit(rowsPerPage)
            .offset(page * rowsPerPage)
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
