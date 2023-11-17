import { Type, type Static } from "@sinclair/typebox";

export const boardgames = {
  querystring: Type.Object({
    limit: Type.Integer({ minimum: 0, maximum: 100, default: 25 }),
    offset: Type.Integer({ minimum: 0, default: 0 }),
  }),
  response: {
    200: Type.Object(
      {
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
