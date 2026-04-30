import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const siteCss = readFileSync(new URL("../src/styles/site.css", import.meta.url), "utf8");

test("detail body uses flow spacing instead of a shared grid gap", () => {
  assert.doesNotMatch(
    siteCss,
    /\.detail-body\s*\{[\s\S]*display:\s*grid;[\s\S]*gap:\s*26px;[\s\S]*\}/
  );
});

test("detail headings define tighter follow-up spacing than section spacing", () => {
  assert.match(siteCss, /\.detail-body h2 \+ h3\s*\{[\s\S]*margin-top:\s*14px;[\s\S]*\}/);
  assert.match(
    siteCss,
    /\.detail-body h3 \+ :is\(p,\s*ul,\s*ol,\s*pre,\s*blockquote,\s*table,\s*hr\)\s*\{[\s\S]*margin-top:\s*10px;[\s\S]*\}/
  );
});
