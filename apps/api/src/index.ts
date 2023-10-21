import Fastify from "fastify";
import {
  Type,
  type FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";
import Swagger from "@fastify/swagger";
import SwaggerUi from "@fastify/swagger-ui";
import pgp from "pg-promise";

interface AppErrorOptions {
  cause?: unknown;
  statusCode: number;
}

class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, options: AppErrorOptions) {
    super(message, options);
    this.statusCode = options.statusCode;
  }
}

const config = {
  server: {
    port: process.env["SERVER_PORT"] ? +process.env["SERVER_PORT"] : 3000,
  },
  pg: {
    url: process.env["PG_URL"],
  },
  log: {
    level: process.env["LOG_LEVEL"] ?? "info",
  },
};

if (!config.pg.url) {
  throw new Error("PG_URL env variable must be set");
}

const pg = pgp()({
  connectionString: config.pg.url,
});

const startPgConnection = async (): Promise<void> => {
  try {
    fastify.log.info("Starting PostgreSQL");
    await pg.query("SELECT 1+1");
    fastify.log.info("Postgres is ready");
  } catch (error) {
    throw new Error("Postgres connection error", { cause: error });
  }
};

const fastify = Fastify({
  logger: {
    level: config.log.level,
  },
});

fastify.addHook("onClose", async () => {
  await pg.$pool.end();
  fastify.log.info("Postgres shut down");
  fastify.log.info("Fastify shut down");
});

fastify.setErrorHandler(async (error, request, reply) => {
  if (error instanceof AppError) {
    fastify.log.warn(error);
    return reply.code(error.statusCode).send({ error: error.message });
  }

  if (error.code === "FST_ERR_VALIDATION") {
    fastify.log.warn(error);
    return reply.code(400).send({ error: error.message });
  }

  fastify.log.error(error);
  await reply.code(500).send({ error: "Internal Server Error" });
  await fastify.close();
  process.exitCode = 1;
});

// eslint-disable-next-line @typescript-eslint/require-await
const Routes: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    "/ping",
    {
      schema: {
        querystring: Type.Object({
          ok: Type.Boolean(),
        }),
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (response) => {
      if (response.query.ok) {
        return pg.one("SELECT 1+1 as message");
      }

      throw new AppError("Controlled error", {
        statusCode: 418,
      });
    },
  );
};

try {
  await startPgConnection();
  await fastify.register(Swagger);
  await fastify.register(SwaggerUi);
  await fastify.register(Routes);
  await fastify.listen({ port: config.server.port });
} catch (err) {
  fastify.log.error(err);
  await fastify.close();
  process.exitCode = 1;
}

for (const event of ["SIGTERM", "SIGINT"]) {
  process.once(event, () => {
    fastify.log.info(`Received ${event} signal`);
    const timeout = setTimeout(() => {
      fastify.log.error(
        `Grateful shutdown ${event} timed out. Exiting abruptly..`,
      );
      process.exit(1);
    }, 10000);
    fastify.close(() => {
      clearTimeout(timeout);
    });
  });
}

for (const event of ["uncaughtException", "unhandledRejection"]) {
  process.once(event, (error) => {
    fastify.log.error(error, `Received ${event} error`);
    const timeout = setTimeout(() => {
      fastify.log.error(
        `Grateful shutdown ${event} timed out. Exiting abruptly..`,
      );
      process.exit(1);
    }, 10000);
    fastify.close(() => {
      clearTimeout(timeout);
      process.exitCode = 1;
    });
  });
}
