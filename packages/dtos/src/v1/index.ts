import { Type, type Static } from "@sinclair/typebox";

export const boardgames = {
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
  response: {
    200: Static<(typeof boardgames.response)["200"]>;
  };
};
