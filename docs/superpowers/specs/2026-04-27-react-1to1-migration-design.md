# React 1:1 迁移设计

## 背景

当前站点基于 `Vite + 原生 ES Modules` 实现，主入口为 [index.html](/D:/MyWeb/index.html) 和 [site.js](/D:/MyWeb/src/scripts/site.js)。页面渲染依赖字符串模板和 `innerHTML`，路由依赖 `window.location.hash`，内容来自 `content/**/*.md`，编辑器页面通过本地开发接口写入内容和上传图片。

本次目标是在 **不改变现有信息架构、URL 语义、视觉风格和内容模型** 的前提下，将站点整体迁移为 React 应用，并集成 React Bits 的 `ClickSpark` 组件。

## 目标

- 将现有单页哈希站点迁移到 React。
- 保留现有哈希路由语义：
  - `#/notes`
  - `#/projects/:slug`
  - `#/reading`
  - `#/now`
  - `#/editor`
- 保留现有页面视觉结构和交互行为。
- 保留 Markdown 内容来源与解析结果。
- 保留编辑器页的预览、保存、上传图片能力。
- 在主内容区集成 `ClickSpark`，不影响侧边栏交互。

## 非目标

- 不改为 history 路由。
- 不引入全局状态库。
- 不重做 UI 设计和文案。
- 不修改 Markdown 数据结构。
- 不顺手修复现有编码异常文本。
- 不做 SSR、SSG 或内容构建链重写。

## 实现策略

采用 **单入口 React SPA，继续使用 hash 路由**。

原因：

- 与当前实现最接近，迁移风险最低。
- 可以直接复用现有路由模型和内容读取逻辑。
- 能把本次改动范围严格控制在“视图层迁移”。

不采用 `react-router-dom`。本次目标是 1:1 迁移，不需要为后续扩展提前引入额外抽象。

## 目标结构

建议目录如下：

```text
src/
  app/
    App.jsx
    routes.js
    useHashRoute.js
  components/
    layout/
      ShellLayout.jsx
      Sidebar.jsx
      ContentFooter.jsx
      ContextPanel.jsx
    pages/
      ListPage.jsx
      DetailPage.jsx
      EditorPage.jsx
    content/
      PostList.jsx
      PostListItem.jsx
      ArticleToc.jsx
    effects/
      ClickSpark.jsx
  data/
    contentModel.js
    editorUtils.js
    siteContent.js
    siteData.js
  styles/
    site.css
  main.jsx
```

说明：

- `app/` 负责路由状态和应用装配。
- `components/layout/` 承接当前页面外壳。
- `components/pages/` 承接当前三种页面类型。
- `components/content/` 放列表项、目录等可复用片段。
- `components/effects/ClickSpark.jsx` 单独放置，避免污染业务代码。
- `data/` 主要是对现有 `.mjs` 工具模块的平移，优先保持逻辑一致。

## 架构设计

### 1. 应用入口

- 新增 `src/main.jsx` 作为 React 挂载入口。
- `index.html` 改为单挂载点结构。
- `vite.config.js` 切到 React 插件模式，并移除当前无实际必要的多 HTML 输入。

### 2. 路由层

- 新增 `useHashRoute.js` 监听 `hashchange`。
- 路由解析逻辑继续沿用当前 `getRouteState()` 的规则。
- `App.jsx` 根据路由状态渲染：
  - `ListPage`
  - `DetailPage`
  - `EditorPage`

### 3. 数据层

- `site-data.mjs`、`site-content.mjs`、`editor-utils.mjs`、`content-model.mjs` 平移到 `src/data/`。
- 内容仍通过 `import.meta.glob("../../content/**/*.md", { eager: true })` 读取。
- 输出数据结构保持兼容，避免连带重写页面逻辑。

### 4. 布局层

- `ShellLayout` 负责整体壳结构。
- `Sidebar` 负责栏目导航和外链。
- `ContentFooter` 负责页脚年份与站点名称。
- `ContextPanel` 负责列表页的文章导航和详情页的目录导航。

### 5. 页面层

#### ListPage

- 替代当前 `renderListPage()`
- 负责栏目头部、描述、文章列表、空状态

#### DetailPage

- 替代当前 `renderDetailPage()`
- 负责文章头部、正文、标签、返回链接、目录

#### EditorPage

- 替代当前 `renderEditorPage()` 和 `mountEditorPage()`
- 使用 React 状态驱动表单、预览、保存和图片上传
- 保持开发环境限制逻辑

## ClickSpark 集成方案

`ClickSpark` 只包裹主内容区，不包裹整个 `.shell`。

推荐挂载位置：

```jsx
<ShellLayout>
  <ClickSpark>
    <RoutedPage />
  </ClickSpark>
</ShellLayout>
```

原因：

- 避免点击侧边栏导航时也触发火花效果。
- 保证文章列表、详情页、编辑页都能复用该效果。
- 后续若需要对某些页面禁用，可以在页面层局部控制。

本次采用 `JavaScript + CSS` 版本，按项目当前语言偏好保持 `jsx`，避免额外引入 TypeScript 迁移成本。

## 数据流

### 路由数据流

1. 浏览器 hash 变化
2. `useHashRoute()` 解析为 `{ type, section, slug }`
3. `App.jsx` 决定当前渲染页面
4. 页面组件读取内容数据并渲染

### 内容数据流

1. `siteContent.js` 从 `content/**/*.md` 建立内容索引
2. 页面组件按 `section` 和 `slug` 获取内容
3. 详情页将 Markdown 解析结果渲染到正文区域

### 编辑器数据流

1. React 表单状态驱动元数据和正文输入
2. 预览区域基于当前输入实时渲染
3. 保存时调用本地开发接口
4. 上传图片成功后插入正文内容并刷新预览

## 迁移顺序

1. 安装 `react`、`react-dom`、`@vitejs/plugin-react`
2. 调整 `vite.config.js` 到 React 入口模式
3. 新建 `src/main.jsx` 与 `src/app/App.jsx`
4. 平移数据层模块到 `src/data/`
5. 实现 `useHashRoute()` 与路由分发
6. 实现 `ShellLayout`、`Sidebar`、`ContentFooter`
7. 实现 `ListPage`
8. 实现 `DetailPage`
9. 实现 `EditorPage`
10. 接入 `ClickSpark`
11. 删除旧的原生页面入口与不再使用的脚本
12. 运行构建与功能验证

## 错误处理与边界

- hash 为空时跳转默认栏目。
- 非法 `section` 或无效路径回退到默认栏目。
- 详情页 `slug` 不存在时回退到对应栏目列表。
- 编辑器标题为空时禁止保存。
- 编辑器正文为空时禁止保存。
- 图片上传失败时显示错误状态，不破坏当前输入内容。
- 仅在开发环境开放编辑器持久化能力。

## 风险与控制

### 风险 1：编辑器迁移后行为回归

原因：

- 现有编辑器依赖 DOM 查询、事件监听和直接 `innerHTML` 预览。

控制：

- 优先复用现有工具函数与接口语义。
- 迁移后逐项验证标题、slug、预览、上传、保存行为。

### 风险 2：迁移过程中误改路由行为

原因：

- 现有路由是业务行为核心，很多跳转依赖固定 hash 格式。

控制：

- 保留现有 `getRouteState()` 规则，不重写路由协议。
- 为 route 解析补最小测试。

### 风险 3：旧代码过早删除

原因：

- 若先删旧逻辑，再搭 React，容易让站点进入不可运行状态。

控制：

- 先建立新 React 入口并跑通，再移除旧入口文件。

## 验证标准

- `npm run build` 成功。
- 默认访问能落到默认栏目。
- 四个栏目列表可以正常切换。
- 列表项进入详情页正常。
- 详情页目录按钮滚动定位正常。
- 编辑器页面在开发环境可用。
- 编辑器预览、保存、图片上传正常。
- `ClickSpark` 在主内容区点击可见。
- 侧边栏导航不受 `ClickSpark` 干扰。

## 最小实施原则

- 尽量复用现有 CSS，不在迁移阶段重写样式体系。
- 尽量复用现有数据工具，不在迁移阶段重写内容模型。
- 每一步都保证站点可构建、可运行，避免大爆炸式重构。
