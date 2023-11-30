import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { login, logout, register } from "common/dtos/v1";
import { compare as bcryptCompare, hash as bcryptHash } from "bcrypt";
import { errorCodes, regexp } from "common";

const SALT_ROUNDS = 10;

export const authRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.post(
    "/auth/register",
    { schema: register },
    async (request, reply) => {
      const { email, password } = request.body;

      if (!regexp.email.pattern.test(email)) {
        return reply.errors.badRequest({
          message: `Invalid email: ${regexp.email.description}`,
          code: errorCodes.invalidEmail,
        });
      }
      if (!regexp.password.pattern.test(password)) {
        return reply.errors.badRequest({
          message: `Invalid password: ${regexp.password.description}`,
          code: errorCodes.invalidPassword,
        });
      }

      const emailExists = await fastify.kysely
        .selectFrom("users")
        .where("email", "=", email)
        .executeTakeFirst();

      if (emailExists) {
        return reply.errors.conflict({
          message: "Email already exists",
          code: errorCodes.emailExists,
        });
      }

      const hashPassword = await bcryptHash(password, SALT_ROUNDS);

      return fastify.kysely
        .insertInto("users")
        .values({
          email,
          password: hashPassword,
        })
        .returning(["users.userId as id", "users.email"])
        .executeTakeFirstOrThrow();
    },
  );

  fastify.post("/auth/login", { schema: login }, async (request, reply) => {
    const { email, password } = request.body;

    const user = await fastify.kysely
      .selectFrom("users as u")
      .select(["u.userId as id", "u.email", "u.password"])
      .where("u.email", "=", email)
      .executeTakeFirst();

    if (!user) {
      return reply.errors.unauthorized({
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await bcryptCompare(password, user.password);

    if (!isValidPassword) {
      return reply.errors.unauthorized({
        message: "Invalid email or password",
      });
    }

    const userData = {
      id: user.id,
      email: user.email,
    };

    request.session.user = userData;

    return userData;
  });

  fastify.get("/auth/logout", { schema: logout }, async (request, reply) => {
    if (request.session.user) {
      await request.session.destroy();
    }
    return reply.code(204).send();
  });
};
