---
title: "AI 读书笔记助手"
status: "进行中"
date: "2026-04-18"
summary: "上传 PDF 后自动提取章节与要点，并结合知识库问答帮助复盘整本书。"
cover: "/content-assets/projects/project-cover.png"
tags:
  - "FastAPI"
  - "RAG"
  - "ChromaDB"
---

## 当前功能

系统支持上传 PDF 后自动抽取章节结构、摘要和关键词，并按书籍隔离建立知识库。
问答区会优先引用当前书籍内容，避免回答跑偏成泛知识聊天。

## 技术重点

后端使用 FastAPI 处理文件上传和任务调度，LangChain 负责文档处理链路，ChromaDB 作为轻量向量库使用。
现在真正耗时的不是模型调用，而是检索质量和引用片段展示这两块。

## 下一步

准备补章节级阅读进度和问题历史，后续再做书与书之间的跨文档对比。
