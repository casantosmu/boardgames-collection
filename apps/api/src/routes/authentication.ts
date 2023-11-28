import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { login, logout } from "dtos/v1";

export const authenticationRoutes: FastifyPluginAsyncTypebox = async (
  fastify,
) => {
  fastify.post("/login", { schema: login }, async (request, reply) => {
    if (
      request.body.email === "email@example.com" &&
      request.body.password === "1234"
    ) {
      request.session.authenticated = true;
      return reply.code(204).send();
    } else {
      return reply.errors.unauthorized("Invalid email or password");
    }
  });

  fastify.post("/logout", { schema: logout }, async (request, reply) => {
    if (request.session.authenticated) {
      await request.session.destroy();
    }
    return reply.code(204).send();
  });
};
