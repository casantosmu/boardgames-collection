import "dotenv/config";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: process.env["API_BASE_URL"],
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/static": {
        target: process.env["IMAGES_BASE_URL"],
      },
    },
  },
  plugins: [react()],
});
