import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_SECTION,
  getDefaultHash,
  getRouteState,
  findItemBySlug
} from "../src/scripts/site-data.mjs";

test("默认路由跳到 notes 列表页", () => {
  assert.equal(DEFAULT_SECTION, "notes");
  assert.equal(getDefaultHash(), "#/notes");
});

test("可以解析学习笔记详情页路由", () => {
  assert.deepEqual(getRouteState("#/notes/rag-search-quality"), {
    type: "detail",
    section: "notes",
    slug: "rag-search-quality"
  });
});

test("非法路由会回退到默认列表页", () => {
  assert.deepEqual(getRouteState("#/unknown/path"), {
    type: "list",
    section: "notes",
    slug: null
  });
});

test("可以按 section 和 slug 找到详情条目", () => {
  const item = findItemBySlug("projects", "ai-book-notes-assistant");

  assert.ok(item);
  assert.equal(item.title, "🤖 AI 读书笔记助手");
  assert.equal(item.detailTitle, "🤖 AI 读书笔记助手");
});
