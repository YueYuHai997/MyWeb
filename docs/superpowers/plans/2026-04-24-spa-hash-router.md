# Hash Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前多页面静态站点改成单页 `Hash Router`，并为导航、页头、卡片标题增加轻活泼的 emoji 点缀。

**Architecture:** 保留单个 `index.html` 作为唯一主入口，左侧侧栏固定，右侧内容由 `site.js` 根据 `location.hash` 渲染。旧的 `notes.html`、`projects.html`、`reading.html`、`now.html` 不再承载正文，而是做兼容跳转到对应 hash 路由。

**Tech Stack:** Vite 6、原生 HTML/CSS/JavaScript

---

### Task 1: 单页入口和内容容器

**Files:**
- Modify: `D:\PersonWeb2\index.html`

- [ ] 把导航链接改成 `#/home`、`#/notes`、`#/projects`、`#/reading`、`#/now`
- [ ] 把右侧主内容改成脚本可渲染的容器节点
- [ ] 保留公共侧栏、页脚和脚本入口

### Task 2: Hash Router 与页面数据

**Files:**
- Modify: `D:\PersonWeb2\src\scripts\site.js`

- [ ] 定义统一的页面配置对象，收敛原先多个 html 的正文内容
- [ ] 监听首次加载与 `hashchange`
- [ ] 对空 hash 和非法 hash 回退到 `#/home`
- [ ] 每次渲染后更新活动导航和重绑显现动画

### Task 3: 轻活泼视觉调整

**Files:**
- Modify: `D:\PersonWeb2\src\styles\site.css`

- [ ] 为导航、页头、卡片标题增加 emoji 适配样式
- [ ] 强化激活导航与卡片层级，但保持整体简洁
- [ ] 保证移动端布局不被新样式破坏

### Task 4: 旧页面兼容与构建入口收敛

**Files:**
- Modify: `D:\PersonWeb2\vite.config.js`
- Modify: `D:\PersonWeb2\notes.html`
- Modify: `D:\PersonWeb2\projects.html`
- Modify: `D:\PersonWeb2\reading.html`
- Modify: `D:\PersonWeb2\now.html`
- Modify: `D:\PersonWeb2\portfolio.html`

- [ ] 将 Vite 构建入口收敛到主入口和兼容跳转页
- [ ] 旧页面通过 `meta refresh` 和链接回退到对应 hash
- [ ] 历史入口 `portfolio.html` 继续保留跳转能力

### Task 5: 验证

**Files:**
- Verify only

- [ ] 运行 `npm run build`
- [ ] 确认打包成功且无语法错误
- [ ] 检查生成产物包含主入口和兼容跳转页
