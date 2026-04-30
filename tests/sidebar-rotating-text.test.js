import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("sidebar rotating text chip keeps centered layout when combined with text-rotate", async () => {
  const css = await readFile(new URL("../src/styles/site.css", import.meta.url), "utf8");
  const match = css.match(/\.sidebar-rotating-text-chip\.text-rotate\s*\{([^}]*)\}/);

  assert.ok(match, "missing combined selector for sidebar rotating text chip");

  const ruleBody = match[1];

  assert.match(ruleBody, /display:\s*inline-flex\s*;/, "expected inline-flex on combined selector");
  assert.match(ruleBody, /justify-content:\s*center\s*;/, "expected horizontal centering on combined selector");
  assert.match(ruleBody, /align-items:\s*center\s*;/, "expected vertical centering on combined selector");
});
