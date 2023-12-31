import type { FastifyPluginAsync, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { ErrorCodes } from "common";

declare module "fastify" {
  interface FastifyReply {
    errors: ReplyErrors;
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
  ) {
    super(message);
  }
}

class ReplyErrors {
  constructor(private readonly reply: FastifyReply) {}

  badRequest({
    code = ErrorCodes.badRequest,
    message = "Bad Request",
  }): FastifyReply {
    return this.reply.send(new ApiError(message, 400, code));
  }

  unauthorized({
    code = ErrorCodes.unauthorized,
    message = "Unauthorized",
  }): FastifyReply {
    return this.reply.send(new ApiError(message, 401, code));
  }

  notFound({
    code = ErrorCodes.notFound,
    message = "Not Found",
  }): FastifyReply {
    return this.reply.send(new ApiError(message, 404, code));
  }

  conflict({ code = ErrorCodes.conflict, message = "Conflict" }): FastifyReply {
    return this.reply.send(new ApiError(message, 409, code));
  }
}

const pluginCallback: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest("errors", null);
  fastify.addHook("onRequest", async (request, reply) => {
    reply.errors = new ReplyErrors(reply);
  });

  fastify.setErrorHandler(async (error, request, reply) => {
    if (error instanceof ApiError) {
      if (error.statusCode < 500) {
        request.log.warn(error);
      } else {
        request.log.error(error);
      }
      return reply.code(error.statusCode).send({
        message: error.message,
        code: error.code,
      });
    }

    if (error.validation) {
      request.log.warn(error);
      return reply.code(400).send({
        message: error.message,
        code: ErrorCodes.validation,
      });
    }

    request.log.error(error);
    await reply.code(500).send({
      message: "Internal Server Error",
      code: ErrorCodes.internalServerError,
    });
    await fastify.close();
    process.exitCode = 1;
  });

  fastify.setNotFoundHandler(async (request, reply) => {
    await reply.errors.notFound({
      message: "Route not found",
      code: ErrorCodes.routeNotFound,
    });
  });
};

export const errorsPlugin = fp(pluginCallback);
