import { compare as bcryptCompare, hash as bcryptHash } from "bcrypt";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { errorCodes, regexp, DtosV1 } from "common";

const SALT_ROUNDS = 10;

export const authRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.post(
    "/auth/register",
    {
      schema: {
        summary: "Registers a new user and returns authentication information",
        tags: ["auth"],
        body: DtosV1.Register.Body,
        response: {
          200: {
            ...DtosV1.Register.Response[200],
            description: "Success",
            headers: {
              "Set-Cookie": {
                type: "string",
                example: "sessionId=abc123; Path=/; HttpOnly;",
              },
            },
          },
          400: DtosV1.Errors[400],
          409: DtosV1.Errors[409],
          500: DtosV1.Errors[500],
        },
      },
    },
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

  fastify.post(
    "/auth/login",
    {
      schema: {
        summary: "Logs in and returns the authentication cookie",
        tags: ["auth"],
        body: DtosV1.Login.Body,
        response: {
          200: {
            ...DtosV1.Login.Response[200],
            description: "Success",
            headers: {
              "Set-Cookie": {
                type: "string",
                example: "sessionId=abc123; Path=/; HttpOnly;",
              },
            },
          },
          401: DtosV1.Errors[401],
          500: DtosV1.Errors[500],
        },
      },
    },
    async (request, reply) => {
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
    },
  );

  fastify.get(
    "/auth/logout",
    {
      schema: {
        summary: "Logs out and clears the authentication cookie",
        tags: ["auth"],
        response: {
          204: {
            type: "null",
            description: "Success",
          },
          500: DtosV1.Errors[500],
        },
      },
    },
    async (request, reply) => {
      if (request.session.user) {
        await request.session.destroy();
      }
      return reply.code(204).send();
    },
  );
};
