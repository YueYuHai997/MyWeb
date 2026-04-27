# Markdown Content Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `notes / projects / reading / now` 的内容源从硬编码 JS 数组切换为 `content/<section>/*.md` 真实 Markdown 文件。

**Architecture:** 保留现有 Vite + hash 路由页面壳子，只替换数据层与详情渲染层。使用 `import.meta.glob` 读取 Markdown 原文，解析 Frontmatter 和正文后生成统一内容模型，再交给现有列表页和详情页渲染。

**Tech Stack:** Vite、原生 Node test、`yaml`、`marked`

---

### Task 1: 建立 Markdown 内容模型与测试

**Files:**
- Create: `D:\MyWeb\src\scripts\content-model.mjs`
- Modify: `D:\MyWeb\tests\site-data.test.mjs`

- [ ] **Step 1: 写失败测试**

```javascript
test("可以从 Markdown 解析元数据和正文", () => {
  const doc = `---
title: 示例
date: 2026-04-27
tags:
  - AI
draft: false
---

## 标题

正文`;

  const item = parseMarkdownDocument("notes", "example", doc);

  assert.equal(item.title, "示例");
  assert.equal(item.slug, "example");
  assert.equal(item.tags[0], "AI");
  assert.match(item.html, /<h2/);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL，提示 `parseMarkdownDocument` 或相关模块不存在。

- [ ] **Step 3: 写最小实现**

```javascript
export function parseMarkdownDocument(section, slug, source) {
  // 解析 frontmatter、正文、摘要、日期排序字段
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: 新增解析测试通过。

- [ ] **Step 5: 提交**

```powershell
git add tests/site-data.test.mjs src/scripts/content-model.mjs
git commit -m "test: add markdown content model coverage"
```

### Task 2: 用 Markdown 替换硬编码数据源

**Files:**
- Modify: `D:\MyWeb\src\scripts\site-data.mjs`
- Modify: `D:\MyWeb\src\scripts\site.js`

- [ ] **Step 1: 写失败测试**

```javascript
test("Markdown 内容会按 section 聚合并按规则排序", () => {
  const content = buildContentIndex({
    "../../content/notes/b.md": "...",
    "../../content/notes/a.md": "..."
  });

  assert.equal(content.notes.length, 2);
  assert.equal(content.notes[0].slug, "a");
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL，提示 `buildContentIndex` 未定义或排序不符合预期。

- [ ] **Step 3: 写最小实现**

```javascript
const markdownModules = import.meta.glob("../../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true
});

export const contentBySection = buildContentIndex(markdownModules);
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test`
Expected: 聚合、排序、查找、路由测试通过。

- [ ] **Step 5: 提交**

```powershell
git add src/scripts/site-data.mjs src/scripts/site.js tests/site-data.test.mjs
git commit -m "feat: load site content from markdown files"
```

### Task 3: 迁移现有内容到 `content` 目录并验证构建

**Files:**
- Create: `D:\MyWeb\content\notes\*.md`
- Create: `D:\MyWeb\content\projects\*.md`
- Create: `D:\MyWeb\content\reading\*.md`
- Create: `D:\MyWeb\content\now\*.md`
- Modify: `D:\MyWeb\package.json`
- Modify: `D:\MyWeb\package-lock.json`

- [ ] **Step 1: 写失败测试**

```javascript
test("真实 Markdown 内容可以被 findItemBySlug 找到", () => {
  const item = findItemBySlug("projects", "ai-book-notes-assistant");
  assert.ok(item);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm test`
Expected: FAIL，提示内容不存在或字段不完整。

- [ ] **Step 3: 写最小实现**

```markdown
---
title: AI 读书笔记助手
status: 进行中
summary: ...
tags:
  - FastAPI
---
```

- [ ] **Step 4: 运行完整验证**

Run:
- `npm test`
- `npm run build`

Expected:
- 测试全部通过
- Vite 构建成功

- [ ] **Step 5: 提交**

```powershell
git add content package.json package-lock.json
git commit -m "feat: migrate site content into markdown files"
```
