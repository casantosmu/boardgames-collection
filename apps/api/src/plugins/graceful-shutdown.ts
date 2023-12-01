import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const SIGNAL_EVENTS = ["SIGTERM", "SIGINT"];
const ERROR_EVENTS = ["uncaughtException", "unhandledRejection"];

const setTimeOut = (event: string): NodeJS.Timeout => {
  return setTimeout(() => {
    // eslint-disable-next-line no-console
    console.error(`Grateful shutdown ${event} timed out. Exiting abruptly..`);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }, 10 * 1000);
};

const pluginCallback: FastifyPluginAsync = async (fastify) => {
  for (const event of SIGNAL_EVENTS) {
    process.once(event, () => {
      fastify.log.info(`Received ${event} signal`);
      const timeout = setTimeOut(event);
      fastify.close(() => {
        clearTimeout(timeout);
      });
    });
  }

  for (const event of ERROR_EVENTS) {
    process.once(event, (error) => {
      fastify.log.error(error, `Received ${event} error`);
      const timeout = setTimeOut(event);
      fastify.close(() => {
        clearTimeout(timeout);
        process.exitCode = 1;
      });
    });
  }
};

export const gracefulShutdownPlugin = fp(pluginCallback);
