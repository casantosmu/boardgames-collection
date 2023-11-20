import type { FastifyPluginAsync, FastifyReply } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyReply {
    errors: ReplyErrors;
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

class ReplyErrors {
  constructor(private readonly reply: FastifyReply) {}

  badRequest(message?: string): FastifyReply {
    return this.reply.send(new ApiError(message ?? "Bad Request", 400));
  }

  notFound(message?: string): FastifyReply {
    return this.reply.send(new ApiError(message ?? "Not Found", 404));
  }
}

const pluginCb: FastifyPluginAsync = async (fastify) => {
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
      return reply.code(error.statusCode).send({ error: error.message });
    }

    if (error.code === "FST_ERR_VALIDATION") {
      request.log.warn(error);
      return reply.code(400).send({ error: error.message });
    }

    request.log.error(error);
    await reply.code(500).send({ error: "Internal Server Error" });
    await fastify.close();
    process.exitCode = 1;
  });
};

export const errorsPlugin = fp(pluginCb);
