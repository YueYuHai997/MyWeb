import { defineConfig } from "vite";
import { resolve } from "node:path";

import { createDevContentApiPlugin } from "./tools/dev-content-api.mjs";

export default defineConfig({
  plugins: [createDevContentApiPlugin(__dirname)],
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        portfolio: resolve(__dirname, "portfolio.html"),
        notes: resolve(__dirname, "notes.html"),
        projects: resolve(__dirname, "projects.html"),
        reading: resolve(__dirname, "reading.html"),
        now: resolve(__dirname, "now.html")
      }
    }
  }
});
