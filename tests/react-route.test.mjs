import test from "node:test";
import assert from "node:assert/strict";

import { normalizeHashRoute } from "../src/app/useHashRoute.js";

test("normalizeHashRoute falls back to default route", () => {
  assert.deepEqual(normalizeHashRoute(""), {
    type: "list",
    section: "notes",
    slug: null,
    hash: "#/notes"
  });
});

test("normalizeHashRoute preserves detail hash", () => {
  assert.deepEqual(normalizeHashRoute("#/projects/demo"), {
    type: "detail",
    section: "projects",
    slug: "demo",
    hash: "#/projects/demo"
  });
});
