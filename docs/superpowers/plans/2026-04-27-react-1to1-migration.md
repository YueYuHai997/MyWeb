# React 1:1 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前基于原生 ES Modules 的哈希单页站点迁移为 React 单入口应用，并在主内容区接入 `ClickSpark`。

**Architecture:** 保留现有 hash 路由协议、Markdown 内容来源、编辑器本地开发接口和 CSS 样式体系，只替换视图层实现。迁移过程中先建立 React 新入口与兼容数据层，再按页面类型逐步替换旧渲染逻辑，最后删除旧入口脚本与多余 HTML。

**Tech Stack:** Vite, React, React DOM, @vitejs/plugin-react, Node test runner, marked, highlight.js, yaml

---

## File Structure

- Create: `src/main.jsx`
- Create: `src/app/App.jsx`
- Create: `src/app/useHashRoute.js`
- Create: `src/components/layout/ShellLayout.jsx`
- Create: `src/components/layout/Sidebar.jsx`
- Create: `src/components/layout/ContentFooter.jsx`
- Create: `src/components/layout/ContextPanel.jsx`
- Create: `src/components/pages/ListPage.jsx`
- Create: `src/components/pages/DetailPage.jsx`
- Create: `src/components/pages/EditorPage.jsx`
- Create: `src/components/content/PostList.jsx`
- Create: `src/components/content/PostListItem.jsx`
- Create: `src/components/content/ArticleToc.jsx`
- Create: `src/components/effects/ClickSpark.jsx`
- Create: `src/data/content-model.js`
- Create: `src/data/editor-utils.js`
- Create: `src/data/site-data.js`
- Create: `src/data/site-content.js`
- Create: `tests/react-route.test.mjs`
- Modify: `package.json`
- Modify: `vite.config.js`
- Modify: `index.html`
- Modify: `tools/dev-content-api.mjs`
- Delete: `src/scripts/site.js`
- Delete: `src/scripts/site-data.mjs`
- Delete: `src/scripts/site-content.mjs`
- Delete: `src/scripts/editor-page.mjs`
- Delete: `src/scripts/editor-utils.mjs`
- Delete: `src/scripts/content-model.mjs`
- Delete: `notes.html`
- Delete: `projects.html`
- Delete: `reading.html`
- Delete: `now.html`
- Delete: `portfolio.html`

### Task 1: React runtime and shared data modules

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Create: `src/data/content-model.js`
- Create: `src/data/editor-utils.js`
- Create: `src/data/site-data.js`
- Create: `src/data/site-content.js`
- Modify: `tools/dev-content-api.mjs`
- Test: `tests/editor-utils.test.mjs`
- Test: `tests/site-data.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { getRouteState, getDefaultHash } from "../src/data/site-data.js";

test("getDefaultHash returns notes route", () => {
  assert.equal(getDefaultHash(), "#/notes");
});

test("getRouteState keeps editor route", () => {
  assert.deepEqual(getRouteState("#/editor"), {
    type: "editor",
    section: null,
    slug: null
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/site-data.test.mjs`
Expected: FAIL with module-not-found for `src/data/site-data.js`

- [ ] **Step 3: Write minimal implementation**

```js
// package.json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.4"
  }
}

// vite.config.js
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react(), createDevContentApiPlugin(__dirname)]
});

// tools/dev-content-api.mjs
import { VALID_SECTIONS } from "../src/data/content-model.js";
import {
  buildMarkdownFile,
  createAssetFileName,
  getTodayDate,
  parseTagsInput,
  slugifyTitle
} from "../src/data/editor-utils.js";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/site-data.test.mjs tests/editor-utils.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add package.json package-lock.json vite.config.js tools/dev-content-api.mjs src/data tests
git commit -m "refactor: move shared content modules for react app"
```

### Task 2: App shell and hash route hook

**Files:**
- Create: `src/main.jsx`
- Create: `src/app/App.jsx`
- Create: `src/app/useHashRoute.js`
- Create: `src/components/layout/ShellLayout.jsx`
- Create: `src/components/layout/Sidebar.jsx`
- Create: `src/components/layout/ContentFooter.jsx`
- Modify: `index.html`
- Test: `tests/react-route.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/react-route.test.mjs`
Expected: FAIL with module-not-found for `src/app/useHashRoute.js`

- [ ] **Step 3: Write minimal implementation**

```jsx
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.jsx";
import "./styles/site.css";

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// index.html
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/react-route.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add index.html src/main.jsx src/app src/components/layout tests/react-route.test.mjs
git commit -m "feat: add react app shell and hash route hook"
```

### Task 3: List and detail pages in React

**Files:**
- Create: `src/components/pages/ListPage.jsx`
- Create: `src/components/pages/DetailPage.jsx`
- Create: `src/components/layout/ContextPanel.jsx`
- Create: `src/components/content/PostList.jsx`
- Create: `src/components/content/PostListItem.jsx`
- Create: `src/components/content/ArticleToc.jsx`
- Modify: `src/app/App.jsx`
- Modify: `src/styles/site.css`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { findItemBySlug } from "../src/data/site-data.js";
import { contentBySection } from "../src/data/site-content.js";

test("notes content can resolve detail item by slug", () => {
  const first = contentBySection.notes[0];
  assert.ok(first);
  assert.equal(findItemBySlug(contentBySection, "notes", first.slug)?.slug, first.slug);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/site-data.test.mjs`
Expected: FAIL until `src/data/site-content.js` and imports are wired for React path

- [ ] **Step 3: Write minimal implementation**

```jsx
// src/app/App.jsx
const isDetail = route.type === "detail";
return (
  <ShellLayout routeKey={route.section ?? "editor"}>
    {isDetail ? (
      <DetailPage route={route} contentBySection={contentBySection} />
    ) : (
      <ListPage route={route} contentBySection={contentBySection} />
    )}
  </ShellLayout>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/site-data.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/app/App.jsx src/components/pages src/components/content src/components/layout/ContextPanel.jsx src/styles/site.css
git commit -m "feat: render list and detail pages with react"
```

### Task 4: Editor page migration

**Files:**
- Create: `src/components/pages/EditorPage.jsx`
- Modify: `src/app/App.jsx`
- Modify: `src/styles/site.css`
- Test: `tests/editor-utils.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { slugifyTitle } from "../src/data/editor-utils.js";

test("slugifyTitle returns note for empty title", () => {
  assert.equal(slugifyTitle(""), "note");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/editor-utils.test.mjs`
Expected: FAIL until editor utils import path is updated and React editor uses shared module

- [ ] **Step 3: Write minimal implementation**

```jsx
// src/components/pages/EditorPage.jsx
const [form, setForm] = useState({
  section: "notes",
  title: "",
  slug: "",
  date: getTodayDate(),
  tags: "",
  summary: "",
  body: ""
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/editor-utils.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/components/pages/EditorPage.jsx src/app/App.jsx src/styles/site.css tests/editor-utils.test.mjs
git commit -m "feat: migrate editor page to react"
```

### Task 5: ClickSpark integration and cleanup

**Files:**
- Create: `src/components/effects/ClickSpark.jsx`
- Modify: `src/app/App.jsx`
- Delete: `src/scripts/site.js`
- Delete: `src/scripts/site-data.mjs`
- Delete: `src/scripts/site-content.mjs`
- Delete: `src/scripts/editor-page.mjs`
- Delete: `src/scripts/editor-utils.mjs`
- Delete: `src/scripts/content-model.mjs`
- Delete: `notes.html`
- Delete: `projects.html`
- Delete: `reading.html`
- Delete: `now.html`
- Delete: `portfolio.html`

- [ ] **Step 1: Write the failing test**

```js
import test from "node:test";
import assert from "node:assert/strict";

import { normalizeHashRoute } from "../src/app/useHashRoute.js";

test("existing routes still normalize after cleanup", () => {
  assert.equal(normalizeHashRoute("#/projects/demo").hash, "#/projects/demo");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/react-route.test.mjs`
Expected: FAIL if cleanup accidentally breaks route compatibility

- [ ] **Step 3: Write minimal implementation**

```jsx
// src/app/App.jsx
<ShellLayout routeKey={route.section ?? "editor"}>
  <ClickSpark sparkColor="#06B6D4" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
    {page}
  </ClickSpark>
</ShellLayout>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/react-route.test.mjs && npm run build`
Expected: PASS and Vite build succeeds

- [ ] **Step 5: Commit**

```powershell
git add src/components/effects/ClickSpark.jsx src/app/App.jsx src/scripts notes.html projects.html reading.html now.html portfolio.html
git commit -m "feat: integrate clickspark in react content shell"
```

## Self-Review

- Spec coverage:
  - React 单入口迁移：Task 1-2
  - 保留 hash 路由：Task 2, Task 5
  - 列表与详情页迁移：Task 3
  - 编辑器迁移：Task 4
  - ClickSpark 接入：Task 5
  - 删除旧入口与冗余页面：Task 5
- Placeholder scan:
  - 无 `TODO` / `TBD`
  - 每个任务包含具体文件和验证命令
- Type consistency:
  - 统一使用 `route.type`, `route.section`, `route.slug`
  - 统一使用 `contentBySection`
