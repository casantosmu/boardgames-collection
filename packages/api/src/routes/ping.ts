import {
  Type,
  type FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";

// eslint-disable-next-line @typescript-eslint/require-await
export const pingRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.post(
    "/ping",
    {
      schema: {
        tags: ["ping"],
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (response, request) => {
      return request.send({ message: "OK" });
    },
  );
};
