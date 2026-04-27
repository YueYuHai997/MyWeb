import { defineConfig } from "vite";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

import { createDevContentApiPlugin } from "./tools/dev-content-api.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), createDevContentApiPlugin(__dirname)]
});
