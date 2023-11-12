import { Type, type Static } from "@sinclair/typebox";

export const boardgames = {
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
};

export type Boardgames = {
  response: {
    200: Static<(typeof boardgames.response)["200"]>;
  };
};
