---
title: RAG学习记录
date: 2026-04-20
summary: RAG项目持续学习中
tags:
  - RAG
  - LangChain
  - 学习与思考
---

## 学习目标
实现一个带有`Rag`和`历史记录`的智能客服
目前已经实现**文档接入** → **向量存储** → **检索增强** → **会话管理** → **上下文优化** → **注入控制**  

##  Rag目前已实现功能
### 基础能力
1. 已支持上传并处理以下格式文件：
	- txt
	- csv
	- doc / docx
	- pdf
2. 向量数据库
	- Chroma 作为本地向量数据库
3. 本地 Embedding
	- 使用 Ollama 部署 qwen3-embedding:0.6b 负责文本向量化。
	
### 对话系统能力
1. 多会话管理
	- 每个对话独立上下文
	- 历史问答追踪
2. 多层历史记忆机制
	- 用户画像层
		- 用户偏好
		- 常问主题
		- 风格习惯
		- 业务领域
	- 历史压缩层
		- 对长对话自动摘要，降低 Token 消耗。
	- 最近 N 轮原文层
		- 保留最近对话原始内容，保证上下文精度。
		
### 文档解析优化
1. PDF Loader 优化

### 检索增强层
1. 多路召回：避免单一路径漏召回。
	- 向量检索
	- 标题检索
	- 摘要检索
	
1. 混合检索：解决专有名词搜不到、精准词召回差、纯关键词理解弱
   - 向量检索（语义）
   - BM25（关键词）
   
1. Reranker 精排
   - 召回 10 ~ 20 条 -> 重排序 -> 输出 Top3~5
   
1. Parent-Child Retriever：小块检索准、大块回答全
	- child chunk：小块做 embedding 检索。
	- parent chunk：大块返回给模型阅读。
	
1. Query Rewrite / Multi Query
	针对用户问题：
	- 自动补全上下文
	- 改写模糊问题
	- 多视角生成查询词
### 上下文注入控制
- RAG 注入筛选
对于以下内容会自动跳过知识库检索与历史注入：
	- 寒暄
	- 闲聊
	- 简单常识问题  
	
## 后续升级规划
### Chunk 智能切分升级
- 标题感知切分
- 语义切分
- 表格独立切分
- 代码块独立切分

### Reranker 升级
- bge-reranker-v2
- jina-reranker

### 检索融合算法升级
 从简单 merge 升级为:
- RRF（Reciprocal Rank Fusion）
- Weighted Score Fusion

### 引用溯源能力
回答附带：来源文档 / 页码 / chunk位置

## 把 RAG 升级成 AI 助手
### Tool Calling
- SQL 查询
- 联网搜索
- Excel 分析
- 邮件总结
- 调接口

### 用户长期记忆系统
例如
- 用户是程序员
- 喜欢 Java
- 常问 SpringBoot

### 个性化知识库
不同用户检索不同知识域：
- 管理层看报表
- 技术看文档
- 客服看 FAQ