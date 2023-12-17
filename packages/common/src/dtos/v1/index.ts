import { Type, type Static } from "@sinclair/typebox";

export const errorsDtos = {
  400: Type.Object(
    {
      message: Type.String(),
      code: Type.String(),
    },
    { description: "Bad Request" },
  ),
  401: Type.Object(
    {
      message: Type.String(),
      code: Type.String(),
    },
    { description: "Unauthorized" },
  ),
  404: Type.Object(
    {
      message: Type.String(),
      code: Type.String(),
    },
    { description: "Not Found" },
  ),
  409: Type.Object(
    {
      message: Type.String(),
      code: Type.String(),
    },
    { description: "Conflict" },
  ),
  500: Type.Object(
    {
      message: Type.String(),
      code: Type.String(),
    },
    { description: "Internal Server Error" },
  ),
};

export type ApiError = Static<(typeof errorsDtos)[keyof typeof errorsDtos]>;

export const registerDtos = {
  Body: Type.Object({
    email: Type.String(),
    password: Type.String(),
  }),
  Response: {
    200: Type.Object({
      id: Type.Integer(),
      email: Type.String(),
    }),
  },
};

export type RegisterDtos = {
  Body: Static<typeof registerDtos.Body>;
  Response: {
    200: Static<(typeof registerDtos.Response)[200]>;
  };
};

export const loginDtos = {
  Body: Type.Object({
    email: Type.String(),
    password: Type.String(),
  }),
  Response: {
    200: Type.Object({
      id: Type.Integer(),
      email: Type.String(),
    }),
  },
};

export type LoginDtos = {
  Body: Static<typeof loginDtos.Body>;
  Response: {
    200: Static<(typeof loginDtos.Response)[200]>;
  };
};

export const getBoardgamesDtos = {
  Querystring: Type.Object({
    rowsPerPage: Type.Integer({ minimum: 1, maximum: 100, default: 25 }),
    page: Type.Integer({ minimum: 0, default: 0 }),
    search: Type.Optional(Type.String()),
    minPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    maxPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    minBestPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    maxBestPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    types: Type.Optional(Type.Array(Type.Integer())),
    categories: Type.Optional(Type.Array(Type.Integer())),
    mechanisms: Type.Optional(Type.Array(Type.Integer())),
  }),
  Response: {
    200: Type.Object({
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
    }),
  },
};

export type GetBoardgamesDtos = {
  Querystring: Static<typeof getBoardgamesDtos.Querystring>;
  Response: {
    200: Static<(typeof getBoardgamesDtos.Response)[200]>;
  };
};

export const getClassificationsDtos = {
  Response: {
    200: Type.Object({
      data: Type.Object({
        types: Type.Array(
          Type.Object({
            id: Type.Integer(),
            name: Type.String(),
          }),
        ),
        categories: Type.Array(
          Type.Object({
            id: Type.Integer(),
            name: Type.String(),
          }),
        ),
        mechanisms: Type.Array(
          Type.Object({
            id: Type.Integer(),
            name: Type.String(),
          }),
        ),
      }),
    }),
  },
};

export type GetClassificationsDtos = {
  Response: {
    200: Static<(typeof getClassificationsDtos.Response)[200]>;
  };
};
