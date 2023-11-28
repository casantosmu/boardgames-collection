import { fastify, type FastifyInstance } from "fastify";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { openApiInfo } from "dtos/v1";
import { errorsPlugin } from "./plugins/errors.js";
import { kyselyPlugin } from "./plugins/kysely.js";
import { gracefulShutdownPlugin } from "./plugins/graceful-shutdown.js";
import { boardgamesRoutes } from "./routes/boardgames.js";
import { classificationsRoutes } from "./routes/classifications.js";
import { pingRoutes } from "./routes/ping.js";
import { authenticationRoutes } from "./routes/authentication.js";
import { sessionPlugin } from "./plugins/session.js";

if (!process.env["PG_URL"]) {
  throw new Error(
    "The 'PG_URL' environment variable is required but not provided.",
  );
}

if (!process.env["SESSION_SECRET"]) {
  throw new Error(
    "The 'SESSION_SECRET' environment variable is required but not provided.",
  );
}

const IS_PRODUCTION = process.env["NODE_ENV"] === "production";
const PG_URL = process.env["PG_URL"];
const SESSION_SECRET = process.env["SESSION_SECRET"];
const LOG_LEVEL = process.env["LOG_LEVEL"] ?? "info";

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: {
      level: LOG_LEVEL,
    },
  });

  // Plugins
  await app.register(gracefulShutdownPlugin);
  await app.register(errorsPlugin);
  await app.register(kyselyPlugin, {
    url: PG_URL,
  });
  await app.register(sessionPlugin, {
    secret: SESSION_SECRET,
    secure: IS_PRODUCTION,
  });
  await app.register(fastifySwagger, {
    openapi: openApiInfo,
  });
  await app.register(fastifySwaggerUi);

  // Routes
  await app.register(boardgamesRoutes, {
    prefix: "/v1",
  });
  await app.register(classificationsRoutes, {
    prefix: "/v1",
  });
  await app.register(authenticationRoutes, {
    prefix: "/v1",
  });
  await app.register(pingRoutes, {
    prefix: "/v1",
  });

  return app;
};
