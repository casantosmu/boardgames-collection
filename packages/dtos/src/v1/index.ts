import { Type, type Static } from "@sinclair/typebox";

export const boardgames = {
  querystring: Type.Object({
    rowsPerPage: Type.Integer({ minimum: 1, maximum: 100, default: 25 }),
    page: Type.Integer({ minimum: 0, default: 0 }),
    search: Type.Optional(Type.String()),
    minPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    maxPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    minBestPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    maxBestPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
  }),
  response: {
    200: Type.Object(
      {
        metadata: Type.Object({
          count: Type.Integer(),
        }),
        data: Type.Array(
          Type.Object({
            id: Type.Integer(),
            rate: Type.Number(),
            name: Type.String(),
            yearPublished: Type.Integer(),
            images: Type.Object({
              original: Type.String(),
              "96x96": Type.String(),
            }),
            description: Type.String(),
            shortDescription: Type.Union([Type.String(), Type.Null()]),
            complexity: Type.Number(),
            minAge: Type.Integer(),
            players: Type.Object({
              min: Type.Integer(),
              max: Type.Union([Type.Integer(), Type.Null()]),
            }),
            duration: Type.Object({
              min: Type.Integer(),
              max: Type.Integer(),
            }),
            bestPlayers: Type.Array(
              Type.Object({
                min: Type.Integer(),
                max: Type.Union([Type.Null(), Type.Integer()]),
              }),
            ),
          }),
        ),
      },
      {
        description: "Success",
      },
    ),
  },
};

export type Boardgames = {
  querystring: Static<typeof boardgames.querystring>;
  response: {
    200: Static<(typeof boardgames.response)["200"]>;
  };
};
