import { fastify, type FastifyInstance } from "fastify";
import { fastifyCors } from "@fastify/cors";
import { errorsPlugin } from "./plugins/errors.js";
import { kyselyPlugin } from "./plugins/kysely.js";
import { openapiPlugin } from "./plugins/openapi.js";
import { boardgamesRoutes } from "./routes/boardgames.js";
import { pingRoutes } from "./routes/ping.js";

if (!process.env["PG_URL"]) {
  throw new Error(
    "The 'PG_URL' environment variable is required but not provided.",
  );
}

const POSTGRES_CONNECTION_URL = process.env["PG_URL"];
const GRATEFUL_SHUTDOWN_TIMEOUT = 10000;

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: {
      level: process.env["LOG_LEVEL"] ?? "info",
    },
  });

  for (const event of ["SIGTERM", "SIGINT"]) {
    process.once(event, () => {
      app.log.info(`Received ${event} signal`);
      const timeout = setTimeout(() => {
        app.log.error(
          `Grateful shutdown ${event} timed out. Exiting abruptly..`,
        );
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
        app.log.error(
          `Grateful shutdown ${event} timed out. Exiting abruptly..`,
        );
        process.exit(1);
      }, GRATEFUL_SHUTDOWN_TIMEOUT);
      app.close(() => {
        clearTimeout(timeout);
        process.exitCode = 1;
      });
    });
  }

  await app.register(fastifyCors);
  await app.register(errorsPlugin);
  await app.register(kyselyPlugin, {
    url: POSTGRES_CONNECTION_URL,
  });
  await app.register(openapiPlugin);
  await app.register(boardgamesRoutes, { prefix: "/v1" });
  await app.register(pingRoutes, { prefix: "/v1" });

  return app;
};
