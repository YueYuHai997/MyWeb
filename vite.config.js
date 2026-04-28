import { defineConfig } from "vite";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

import { createDevContentApiPlugin } from "./tools/dev-content-api.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_BASE = "/MyWeb/";

export default defineConfig(({ command }) => ({
  base: command === "build" ? REPO_BASE : "/",
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react"
  },
  plugins: [react({ jsxRuntime: "automatic" }), createDevContentApiPlugin(__dirname)]
}));
