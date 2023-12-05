export const openapi = {
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
