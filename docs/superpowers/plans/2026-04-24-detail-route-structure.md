# Detail Route Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 去掉首页入口，并把学习笔记、项目、在读 / 读过、近况下的所有条目升级为可进入详情页的双层 Hash Router 结构。

**Architecture:** 左侧导航只保留四个一级栏目，默认进入 `#/notes`。右侧内容按两层路由渲染：列表页使用 `#/section`，详情页使用 `#/section/slug`，并在详情页统一提供返回所属列表的入口。

**Tech Stack:** Vite 6、原生 HTML/CSS/JavaScript、Node.js 内置 `node:test`

---

### Task 1: 抽离可测试的数据与路由工具

**Files:**
- Create: `D:\PersonWeb2\src\scripts\site-data.mjs`
- Create: `D:\PersonWeb2\tests\site-data.test.mjs`
- Modify: `D:\PersonWeb2\package.json`

- [ ] 把一级栏目、条目详情、slug 和路由解析收口到独立模块
- [ ] 用 `node --test` 覆盖默认路由、详情路由解析和条目查找
- [ ] 给 `package.json` 增加 `test` 脚本

### Task 2: 改造单页渲染逻辑

**Files:**
- Modify: `D:\PersonWeb2\src\scripts\site.js`
- Modify: `D:\PersonWeb2\index.html`

- [ ] 删除首页导航与 `home` 路由
- [ ] 默认入口改为 `#/notes`
- [ ] 列表页中的条目改成可点击链接
- [ ] 详情页支持返回所属列表，并保持左侧栏目高亮

### Task 3: 更新样式

**Files:**
- Modify: `D:\PersonWeb2\src\styles\site.css`

- [ ] 为可点击卡片增加交互样式
- [ ] 为详情页增加返回链接、正文、标签和信息区样式
- [ ] 保持移动端可读性

### Task 4: 兼容与验证

**Files:**
- Modify: `D:\PersonWeb2\portfolio.html`
- Modify: `D:\PersonWeb2\notes.html`
- Modify: `D:\PersonWeb2\projects.html`
- Modify: `D:\PersonWeb2\reading.html`
- Modify: `D:\PersonWeb2\now.html`

- [ ] 旧入口页跳转到新的一级栏目 hash
- [ ] 运行 `npm test`
- [ ] 运行 `npm run build`
- [ ] 用浏览器验证列表页、详情页和返回行为
