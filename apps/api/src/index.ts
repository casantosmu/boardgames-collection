import { buildApp } from "./app.js";

const app = await buildApp();

await app.listen({
  port: process.env["SERVER_PORT"] ? +process.env["SERVER_PORT"] : 3000,
});
