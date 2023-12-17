import { Type, type Static } from "@sinclair/typebox";

export const DtosV1 = {
  Errors: {
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
  },
  Register: {
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
  },
  Login: {
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
  },
  GetBoardgames: {
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
  },
};

export type DtosV1 = {
  ApiError: Static<(typeof DtosV1.Errors)[keyof typeof DtosV1.Errors]>;
  Register: {
    Body: Static<typeof DtosV1.Register.Body>;
    Response: {
      200: Static<(typeof DtosV1.Register.Response)[200]>;
    };
  };
  Login: {
    Body: Static<typeof DtosV1.Login.Body>;
    Response: {
      200: Static<(typeof DtosV1.Login.Response)[200]>;
    };
  };
  GetBoardgames: {
    Querystring: Static<typeof DtosV1.GetBoardgames.Querystring>;
    Response: {
      200: Static<(typeof DtosV1.GetBoardgames.Response)[200]>;
    };
  };
};
