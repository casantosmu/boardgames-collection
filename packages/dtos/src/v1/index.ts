import { Type, type Static } from "@sinclair/typebox";

export const openApiInfo = {
  info: {
    title: "Boardgames collection",
    version: "0.1.0",
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "sessionId",
      },
    },
  },
} as const;

export const register = {
  description: "Registers a new user and returns authentication information.",
  tags: ["auth"],
  body: Type.Object({
    email: Type.String(),
    password: Type.String(),
  }),
  response: {
    "200": Type.Object(
      {
        id: Type.Integer(),
        email: Type.String(),
      },
      {
        description: "Success",
        headers: {
          "Set-Cookie": {
            schema: {
              type: "string",
              example: "sessionId=abc123; Path=/; HttpOnly;",
            },
          },
        },
      },
    ),
  },
} as const;

export type Register = {
  body: Static<typeof register.body>;
  response: {
    200: Static<(typeof register.response)["200"]>;
  };
};

export const login = {
  description: "Logs in and returns the authentication cookie.",
  tags: ["auth"],
  body: Type.Object({
    email: Type.String(),
    password: Type.String(),
  }),
  response: {
    "200": Type.Object(
      {
        id: Type.Integer(),
        email: Type.String(),
      },
      {
        description: "Success",
        headers: {
          "Set-Cookie": {
            schema: {
              type: "string",
              example: "sessionId=abc123; Path=/; HttpOnly;",
            },
          },
        },
      },
    ),
  },
} as const;

export type Login = {
  body: Static<typeof login.body>;
  response: {
    200: Static<(typeof login.response)["200"]>;
  };
};

export const logout = {
  description: "Logs out and clears the authentication cookie.",
  tags: ["auth"],
  response: {
    "200": {
      type: "null",
      description: "Success",
    },
  },
} as const;

export const getBoardgames = {
  description: "Get a list of boardgames in the collection",
  tags: ["boardgames"],
  querystring: Type.Object({
    rowsPerPage: Type.Integer({ minimum: 1, maximum: 100, default: 25 }),
    page: Type.Integer({ minimum: 0, default: 0 }),
    search: Type.Optional(Type.String()),
    minPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    maxPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    minBestPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    maxBestPlayers: Type.Optional(Type.Integer({ minimum: 1 })),
    types: Type.Optional(Type.Array(Type.String())),
    categories: Type.Optional(Type.Array(Type.String())),
    mechanisms: Type.Optional(Type.Array(Type.String())),
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
} as const;

export type GetBoardgames = {
  querystring: Static<typeof getBoardgames.querystring>;
  response: {
    200: Static<(typeof getBoardgames.response)["200"]>;
  };
};

export const getClassifications = {
  description: "Get a list of boardgames types, categories and mechanisms",
  tags: ["classifications"],
  response: {
    200: Type.Object(
      {
        data: Type.Object({
          types: Type.Array(Type.String()),
          categories: Type.Array(Type.String()),
          mechanisms: Type.Array(Type.String()),
        }),
      },
      {
        description: "Success",
      },
    ),
  },
} as const;

export type GetClassifications = {
  response: {
    200: Static<(typeof getClassifications.response)["200"]>;
  };
};

export const ping = {
  description: "Ping the server to check its availability",
  tags: ["ping"],
  response: {
    204: {
      type: "null",
      description: "Success",
    },
  },
} as const;
