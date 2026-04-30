import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const siteCss = readFileSync(new URL("../src/styles/site.css", import.meta.url), "utf8");
const sidebarComponent = readFileSync(new URL("../src/components/layout/Sidebar.jsx", import.meta.url), "utf8");

test("Sidebar renders rotating text before the profile heading", () => {
  assert.match(sidebarComponent, /<div className="sidebar-rotating-text">/);
  assert.match(sidebarComponent, /<span className="sidebar-rotating-text-label">K e e p<\/span>/);
  assert.match(sidebarComponent, /<h1 className="s-name">/);
  assert.match(sidebarComponent, /<GradientText/);
  assert.match(sidebarComponent, />\s*YueYuHai\s*<\/GradientText>/);
});

test("site styles place the rotating text inside the sidebar header area", () => {
  assert.match(
    siteCss,
    /\.sidebar-rotating-text\s*\{[\s\S]*display:\s*flex;[\s\S]*align-items:\s*center;[\s\S]*gap:\s*12px;[\s\S]*width:\s*100%;[\s\S]*margin-bottom:\s*28px;[\s\S]*\}/
  );
});
