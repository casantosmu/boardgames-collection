import { fastify } from "fastify";
import { pgPlugin } from "./plugins/pg.js";
import { isAppError } from "./shared/errors.js";
import { pingRoutes } from "./routes/ping.js";
import { openapiPlugin } from "./plugins/openapi.js";

if (!process.env["PG_URL"]) {
  throw new Error("PG_URL env variable must be set");
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

const app = fastify({
  logger: {
    level: config.log.level,
  },
});

app.setErrorHandler(async (error, request, reply) => {
  if (isAppError(error)) {
    app.log.warn(error);
    return reply.code(error.statusCode).send({ error: error.message });
  }

  if (error.code === "FST_ERR_VALIDATION") {
    app.log.warn(error);
    return reply.code(400).send({ error: error.message });
  }

  app.log.error(error);
  await reply.code(500).send({ error: "Internal Server Error" });
  await app.close();
  process.exitCode = 1;
});

for (const event of ["SIGTERM", "SIGINT"]) {
  process.once(event, () => {
    app.log.info(`Received ${event} signal`);
    const timeout = setTimeout(() => {
      app.log.error(`Grateful shutdown ${event} timed out. Exiting abruptly..`);
      process.exit(1);
    }, 10000);
    app.close(() => {
      clearTimeout(timeout);
    });
  });
}

for (const event of ["uncaughtException", "unhandledRejection"]) {
  process.once(event, (error) => {
    app.log.error(error, `Received ${event} error`);
    const timeout = setTimeout(() => {
      app.log.error(`Grateful shutdown ${event} timed out. Exiting abruptly..`);
      process.exit(1);
    }, 10000);
    app.close(() => {
      clearTimeout(timeout);
      process.exitCode = 1;
    });
  });
}

try {
  await app.register(pgPlugin, { connection: config.pg.url });
  await app.register(openapiPlugin, { prefix: "/v1/docs" });
  await app.register(pingRoutes, { prefix: "/v1" });
  await app.listen({ port: config.server.port });
} catch (err) {
  app.log.error(err);
  await app.close();
  process.exitCode = 1;
}
