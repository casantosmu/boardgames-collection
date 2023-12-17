import { Type, type Static } from "@sinclair/typebox";

export const Errors = {
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

export type ApiError = Static<(typeof Errors)[keyof typeof Errors]>;

export const Register = {
  body: Type.Object({
    email: Type.String(),
    password: Type.String(),
  }),
  response: {
    200: Type.Object({
      id: Type.Integer(),
      email: Type.String(),
    }),
  },
};

export type Register = {
  body: Static<typeof Register.body>;
  response: {
    200: Static<(typeof Register.response)[200]>;
  };
};

export const Login = {
  body: Type.Object({
    email: Type.String(),
    password: Type.String(),
  }),
  response: {
    200: Type.Object({
      id: Type.Integer(),
      email: Type.String(),
    }),
  },
};

export type Login = {
  body: Static<typeof Login.body>;
  response: {
    200: Static<(typeof Login.response)[200]>;
  };
};

export const GetBoardgames = {
  querystring: Type.Object({
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
  response: {
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

export type GetBoardgames = {
  querystring: Static<typeof GetBoardgames.querystring>;
  response: {
    200: Static<(typeof GetBoardgames.response)[200]>;
  };
};

export const GetClassifications = {
  response: {
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

export type GetClassifications = {
  response: {
    200: Static<(typeof GetClassifications.response)[200]>;
  };
};
