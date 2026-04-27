import test from "node:test";
import assert from "node:assert/strict";

import {
  slugifyTitle,
  parseTagsInput,
  buildMarkdownFile,
  createImageTag,
  createAssetFileName
} from "../src/scripts/editor-utils.mjs";

test("标题会被转换为稳定 slug", () => {
  assert.equal(slugifyTitle("My First Note"), "my-first-note");
  assert.equal(slugifyTitle("Cs 入门"), "cs-入门");
  assert.equal(slugifyTitle("   "), "note");
});

test("标签输入会被拆成数组", () => {
  assert.deepEqual(parseTagsInput("AI, Markdown\n前端"), ["AI", "Markdown", "前端"]);
});

test("可以生成标准 Markdown 文件内容", () => {
  const content = buildMarkdownFile({
    title: "示例文章",
    date: "2026-04-27",
    summary: "摘要",
    tags: ["AI", "Markdown"],
    draft: false,
    body: "## 标题\n\n正文"
  });

  assert.match(content, /^---\n/);
  assert.match(content, /title: "示例文章"/);
  assert.match(content, /tags:\n  - "AI"\n  - "Markdown"/);
  assert.match(content, /\n---\n\n## 标题/);
});

test("图片标签支持宽度属性", () => {
  assert.equal(
    createImageTag({
      src: "/content-assets/notes/demo.png",
      alt: "demo",
      width: 480
    }),
    '<img src="/content-assets/notes/demo.png" alt="demo" width="480" />'
  );
});

test("图片文件名会被规范化", () => {
  assert.equal(createAssetFileName("My Demo.PNG", "20260427-120000"), "20260427-120000-my-demo.png");
});
