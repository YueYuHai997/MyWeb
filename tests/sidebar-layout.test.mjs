import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const siteCss = readFileSync(new URL("../src/styles/site.css", import.meta.url), "utf8");
const sidebarComponent = readFileSync(new URL("../src/components/layout/Sidebar.jsx", import.meta.url), "utf8");

test("sidebar content is wrapped for offset positioning", () => {
  assert.match(sidebarComponent, /<div className="sidebar-inner">/);
});

test("desktop sidebar uses an upper visual anchor instead of strict centering", () => {
  assert.doesNotMatch(siteCss, /\.sidebar\s*\{[\s\S]*justify-content:\s*center;[\s\S]*\}/);
  assert.match(
    siteCss,
    /\.sidebar-inner\s*\{[\s\S]*margin-block:\s*auto;[\s\S]*transform:\s*translateY\(clamp\(-32px,\s*-4vh,\s*-12px\)\);[\s\S]*\}/
  );
});

test("sidebar upper offset is disabled on mobile", () => {
  assert.match(
    siteCss,
    /@media \(max-width: 840px\)\s*\{[\s\S]*\.sidebar-inner\s*\{[\s\S]*margin-block:\s*0;[\s\S]*transform:\s*none;[\s\S]*\}/
  );
});
