import { buildApp } from "./app.js";

const app = await buildApp();
const PORT = process.env["SERVER_PORT"] ? +process.env["SERVER_PORT"] : 3000;

await app.listen({ port: PORT });
