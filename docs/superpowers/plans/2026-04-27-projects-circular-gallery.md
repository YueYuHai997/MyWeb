# Projects Circular Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 仅将 `projects` 栏目列表页改成基于 React Bits 的 `CircularGallery` 卡片画廊，并为项目内容增加 `cover` 字段。

**Architecture:** 在现有 React 单入口结构上，扩展 Markdown frontmatter 解析，给 `projects` 项目提供 `cover` 数据。`ListPage` 在 `section === "projects"` 时切换到新的 `ProjectsGallery` 分支，内部使用 `ogl` 驱动的 `CircularGallery`，点击卡片后跳转到对应详情页 hash。

**Tech Stack:** React, Vite, ogl, Node test runner, marked, yaml

---
