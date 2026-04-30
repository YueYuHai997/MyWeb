import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  parseMarkdownDocument,
  buildContentIndex
} from "../src/data/content-model.js";
import {
  SITE_NAME,
  DEFAULT_SECTION,
  getDefaultHash,
  getRouteState,
  createContentBySection,
  getProjectGalleryItems,
  getSectionNavigationItems,
  sections
} from "../src/data/site-data.js";

test("默认路由跳到 notes 列表页", () => {
  assert.equal(DEFAULT_SECTION, "notes");
  assert.equal(getDefaultHash(), "#/notes");
  assert.equal(SITE_NAME, "我の编程笔记");
});

test("首页 HTML 使用新的站点标题并声明 favicon", () => {
  const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");

  assert.match(indexHtml, /<title>我の编程笔记<\/title>/);
  assert.match(indexHtml, /rel="icon" href="\/favicon\.svg" type="image\/svg\+xml"/);
  assert.match(indexHtml, /rel="shortcut icon" href="\/favicon\.svg"/);
});

test("favicon.svg 使用笔记本图标", () => {
  const faviconSvg = readFileSync(new URL("../public/favicon.svg", import.meta.url), "utf8");

  assert.match(faviconSvg, /<svg[\s\S]*<\/svg>/);
  assert.match(faviconSvg, /📓/);
});

test("阅读和近况使用与笔记一致的列表布局", () => {
  assert.equal(sections.reading.listLayout, "post-list");
  assert.equal(sections.now.listLayout, "post-list");
  assert.equal(sections.reading.label, "分享");
});

test("可以解析编辑器路由", () => {
  assert.deepEqual(getRouteState("#/editor"), {
    type: "list",
    section: "notes",
    slug: null
  });
});

test("可以解析文章详情路由", () => {
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

test("Markdown 解析会生成正文目录和标题锚点", () => {
  const source = `---
title: 示例文章
date: 2026-04-27
summary: 这是一段摘要
tags:
  - AI
draft: false
---

## 第一节

正文内容。

### 子节标题

更多内容。
`;

  const item = parseMarkdownDocument("notes", "example-post", source, "content/notes/example-post.md");

  assert.equal(item.title, "示例文章");
  assert.equal(item.summary, "这是一段摘要");
  assert.deepEqual(item.tags, ["AI"]);
  assert.deepEqual(item.toc, [
    { id: "第一节", text: "第一节", level: 2 },
    { id: "子节标题", text: "子节标题", level: 3 }
  ]);
  assert.match(item.html, /<h2 id="第一节">第一节<\/h2>/);
  assert.match(item.html, /<h3 id="子节标题">子节标题<\/h3>/);
});

test("Markdown 支持 GFM 扩展语法和代码高亮", () => {
  const source = `---
title: Markdown 能力
date: 2026-04-27
---

- [x] 已完成
- [ ] 待处理

~~删除线~~

| 列1 | 列2 |
| --- | --- |
| A | B |

\`\`\`js
const answer = 42;
\`\`\`
`;

  const item = parseMarkdownDocument("notes", "markdown-feature", source, "content/notes/markdown-feature.md");

  assert.match(item.html, /<input checked="" disabled="" type="checkbox">/);
  assert.match(item.html, /<del>删除线<\/del>/);
  assert.match(item.html, /<table>/);
  assert.match(item.html, /class="hljs language-js"/);
  assert.match(item.html, /class="hljs-keyword"|class="hljs-variable"/);
});

test("Markdown 内容会按 section 聚合并按规则排序", () => {
  const content = buildContentIndex({
    "../../content/notes/second.md": `---
title: 第二篇
date: 2026-04-20
---

正文`,
    "../../content/notes/first.md": `---
title: 第一篇
order: 1
date: 2026-04-01
---

正文`,
    "../../content/notes/draft.md": `---
title: 草稿
draft: true
---

正文`
  });

  assert.equal(content.notes.length, 2);
  assert.equal(content.notes[0].slug, "first");
  assert.equal(content.notes[1].slug, "second");
});

test("site-data 会基于 glob 结果生成内容索引", () => {
  const content = createContentBySection({
    "../../content/notes/example.md": `---
title: Glob 文章
date: 2026-04-21
---

正文`
  });

  assert.equal(content.notes.length, 1);
  assert.equal(content.notes[0].slug, "example");
});

test("大写文件名会被归一化为小写 slug", () => {
  const content = createContentBySection({
    "../../content/notes/Cs.md": `---
title: Cs
date: 2026-04-21
---

正文`
  });

  assert.equal(content.notes.length, 1);
  assert.equal(content.notes[0].slug, "cs");
});

test("列表页右侧导航数据来自当前 section 的文章列表", () => {
  const content = createContentBySection({
    "../../content/notes/alpha.md": `---
title: Alpha
date: 2026-04-21
---

正文`,
    "../../content/notes/beta.md": `---
title: Beta
date: 2026-04-20
---

正文`,
    "../../content/projects/proj.md": `---
title: Project
date: 2026-04-19
---

正文`
  });

  assert.deepEqual(getSectionNavigationItems(content, "notes"), [
    { slug: "alpha", title: "Alpha" },
    { slug: "beta", title: "Beta" }
  ]);
});

test("真实 Markdown 内容可以被聚合到对应 section", () => {
  const content = createContentBySection({
    "../../content/projects/ai-book-notes-assistant.md": readFileSync(
      new URL("../content/projects/ai-book-notes-assistant.md", import.meta.url),
      "utf8"
    ),
    "../../content/notes/rag-search-quality.md": readFileSync(
      new URL("../content/notes/rag-search-quality.md", import.meta.url),
      "utf8"
    )
  });

  assert.equal(content.projects[0].slug, "ai-book-notes-assistant");
  assert.equal(content.notes[0].slug, "rag-search-quality");
});

test("parseMarkdownDocument includes cover when present", () => {
  const source = `---
title: Demo Project
date: 2026-04-27
cover: /content-assets/projects/demo-cover.png
---

正文`;

  const item = parseMarkdownDocument("projects", "demo-project", source, "content/projects/demo-project.md");

  assert.equal(item.cover, "/content-assets/projects/demo-cover.png");
});

test("getProjectGalleryItems maps projects to circular gallery items", () => {
  const content = createContentBySection({
    "../../content/projects/demo.md": `---
title: Demo Project
date: 2026-04-21
cover: /content-assets/projects/demo-cover.png
---

正文`
  });

  assert.deepEqual(getProjectGalleryItems(content.projects), [
    {
      image: "/content-assets/projects/demo-cover.png",
      text: "Demo Project",
      href: "#/projects/demo"
    }
  ]);
});

test("getProjectGalleryItems prefixes repo base for root public asset covers", () => {
  const items = getProjectGalleryItems([
    {
      slug: "demo",
      title: "Demo Project",
      cover: "/content-assets/projects/demo-cover.png"
    }
  ], "/MyWeb/");

  assert.deepEqual(items, [
    {
      image: "/MyWeb/content-assets/projects/demo-cover.png",
      text: "Demo Project",
      href: "#/projects/demo"
    }
  ]);
});
