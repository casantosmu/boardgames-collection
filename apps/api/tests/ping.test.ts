import { test, expect } from "vitest";
import { buildApp } from "../src/app.js";

test("Server runs and responds to ping", async () => {
  const server = await buildApp();

  const response = await server.inject({
    path: "/v1/ping",
    method: "POST",
  });

  expect(response.statusCode).toBe(204);
});
