# Local Markdown Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为本地开发环境提供一个可视化“添加笔记/内容”页面，支持实时 Markdown 预览、图片上传和直接写入 `content/<section>/*.md`。

**Architecture:** 前端增加 `#/editor` 路由，页面使用左编辑右预览布局；Vite dev server 注入仅本地可用的 JSON 接口处理保存 Markdown 和写入图片；文件格式和预览渲染复用现有 Markdown 渲染链路，保证预览与站点显示一致。

**Tech Stack:** Vite、原生 `fetch`、Node `fs/promises`、`yaml`、`marked`、`highlight.js`

---

### Task 1: 共享编辑辅助函数

**Files:**
- Create: `D:\MyWeb\src\scripts\editor-utils.mjs`
- Create: `D:\MyWeb\tests\editor-utils.test.mjs`

- [ ] **Step 1: 写失败测试**
- [ ] **Step 2: 运行 `npm test` 确认失败**
- [ ] **Step 3: 实现 slug 生成、Frontmatter 组装、图片标签插入辅助函数**
- [ ] **Step 4: 运行 `npm test` 确认通过**

### Task 2: 本地保存与图片上传接口

**Files:**
- Create: `D:\MyWeb\tools\dev-content-api.mjs`
- Modify: `D:\MyWeb\vite.config.js`

- [ ] **Step 1: 写失败测试（共享辅助函数覆盖路径与文件名规则）**
- [ ] **Step 2: 运行 `npm test` 确认失败**
- [ ] **Step 3: 实现本地 JSON 接口，支持保存 `.md` 和图片写入 `public/content-assets/<section>/`**
- [ ] **Step 4: 运行 `npm test` 确认已有测试全部通过**

### Task 3: 编辑器页面与路由

**Files:**
- Create: `D:\MyWeb\src\scripts\editor-page.mjs`
- Modify: `D:\MyWeb\src\scripts\content-model.mjs`
- Modify: `D:\MyWeb\src\scripts\site-data.mjs`
- Modify: `D:\MyWeb\src\scripts\site.js`
- Modify: `D:\MyWeb\index.html`
- Modify: `D:\MyWeb\src\styles\site.css`
- Modify: `D:\MyWeb\tests\site-data.test.mjs`

- [ ] **Step 1: 写失败测试（`#/editor` 路由和预览渲染辅助）**
- [ ] **Step 2: 运行 `npm test` 确认失败**
- [ ] **Step 3: 实现编辑器路由、左编右预览、保存和图片插入交互**
- [ ] **Step 4: 运行 `npm test` 确认通过**

### Task 4: 验证

**Files:**
- Verify only

- [ ] **Step 1: 运行 `npm test`**
- [ ] **Step 2: 运行 `npm run build`**
- [ ] **Step 3: 手动确认 `#/editor` 在开发环境中可用**
