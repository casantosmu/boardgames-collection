import { defineConfig } from "vitest/config";

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  test: {
    // options: https://vitest.dev/config/
    setupFiles: "dotenv/config", // load variables form .env file
  },
});
