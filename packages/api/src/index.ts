import { fastify } from "fastify";
import { errorsPlugin } from "./plugins/errors.js";
import { kyselyPlugin } from "./plugins/kysely.js";
import { openapiPlugin } from "./plugins/openapi.js";
import { boardgamesRoutes } from "./routes/boardgames.js";
import { pingRoutes } from "./routes/ping.js";

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

const GRATEFUL_SHUTDOWN_TIMEOUT = 10000;

for (const event of ["SIGTERM", "SIGINT"]) {
  process.once(event, () => {
    app.log.info(`Received ${event} signal`);
    const timeout = setTimeout(() => {
      app.log.error(`Grateful shutdown ${event} timed out. Exiting abruptly..`);
      process.exit(1);
    }, GRATEFUL_SHUTDOWN_TIMEOUT);
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
    }, GRATEFUL_SHUTDOWN_TIMEOUT);
    app.close(() => {
      clearTimeout(timeout);
      process.exitCode = 1;
    });
  });
}

try {
  await app.register(errorsPlugin);
  await app.register(kyselyPlugin, { connectionString: config.pg.url });
  await app.register(openapiPlugin);
  await app.register(boardgamesRoutes, { prefix: "/v1" });
  await app.register(pingRoutes, { prefix: "/v1" });
  await app.listen({ port: config.server.port });
} catch (err) {
  app.log.error(err);
  await app.close();
  process.exitCode = 1;
}
