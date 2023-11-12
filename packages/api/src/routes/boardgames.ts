import {
  Type,
  type FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";

// eslint-disable-next-line @typescript-eslint/require-await
export const boardgamesRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    "/boardgames",
    {
      schema: {
        description: "Get a list of boardgames in the collection",
        tags: ["boardgames"],
        response: {
          200: Type.Object(
            {
              data: Type.Array(
                Type.Object({
                  id: Type.Integer(),
                  rate: Type.Union([Type.Number(), Type.Null()]),
                  name: Type.String(),
                  yearPublished: Type.Integer(),
                  imagePath: Type.String(),
                  description: Type.String(),
                  shortDescription: Type.Union([Type.String(), Type.Null()]),
                  complexity: Type.Number(),
                  minAge: Type.Integer(),
                  minPlayers: Type.Integer(),
                  maxPlayers: Type.Union([Type.Integer(), Type.Null()]),
                  minDuration: Type.Integer(),
                  maxDuration: Type.Integer(),
                }),
              ),
            },
            {
              description: "Success",
            },
          ),
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
