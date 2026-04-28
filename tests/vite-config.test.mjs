import test from "node:test";
import assert from "node:assert/strict";

import viteConfig from "../vite.config.js";

test("vite uses root base in dev and repo base in build for GitHub Pages", async () => {
  const serveConfig = await viteConfig({ command: "serve", mode: "development" });
  const buildConfig = await viteConfig({ command: "build", mode: "production" });
  const pluginNames = serveConfig.plugins.flat().map((plugin) => plugin.name);

  assert.equal(serveConfig.base, "/");
  assert.equal(buildConfig.base, "/MyWeb/");
  assert.ok(pluginNames.includes("vite:react-babel"));
  assert.equal(serveConfig.esbuild.jsx, "automatic");
  assert.equal(serveConfig.esbuild.jsxImportSource, "react");
});
