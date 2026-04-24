export const SITE_NAME = "小林的学习日志";
export const DEFAULT_SECTION = "notes";

export const sections = {
  notes: {
    label: "学习笔记",
    navLabel: "📝 学习笔记",
    title: "📌 学习笔记",
    description: "最近更新 8 篇",
    listLayout: "post-list"
  },
  projects: {
    label: "项目",
    navLabel: "🛠️ 项目",
    title: "🚀 项目",
    description: "当前进行中 2 个",
    listLayout: "post-list"
  },
  reading: {
    label: "在读 / 读过",
    navLabel: "📚 在读 / 读过",
    title: "📚 在读 / 读过",
    description: "最近 4 本",
    listLayout: "inset"
  },
  now: {
    label: "近况",
    navLabel: "🌱 近况",
    title: "🌱 近况",
    description: "2026 年 4 月更新",
    listLayout: "inset"
  }
};

export const contentBySection = {
  notes: [
    {
      slug: "rag-search-quality",
      title: "🧠 RAG 检索质量为什么不稳定",
      detailTitle: "🧠 RAG 检索质量为什么不稳定",
      meta: "2026-04-20 · AI 工程",
      summary: "复盘 HyDE + 混合检索在真实数据集上的调参策略，重点记录 chunk 切分与 query 改写的收益。",
      tags: ["RAG", "LangChain", "调优"],
      lead: "这篇笔记主要回答一个很现实的问题：明明检索链路没变，为什么换一批数据、换一个问题，结果质量就开始漂移。",
      sections: [
        {
          heading: "问题背景",
          paragraphs: [
            "最初的方案是标准向量检索，离线切分文档，在线直接把 query 向量化后召回相似 chunk。这个方案在 demo 数据上看起来很顺，但一上真实资料库，命中率就开始波动。",
            "问题不在某一个模型，而在检索链路对输入形态过于敏感。提问稍微口语化、上下文稍微缺一点，召回结果就会偏。"
          ]
        },
        {
          heading: "排查结论",
          paragraphs: [
            "影响最大的不是 embedding 模型本身，而是 chunk 切分策略和 query 改写质量。chunk 太大，召回内容泛；chunk 太小，语义上下文丢失。",
            "我后面加了 HyDE 和关键词补偿检索，混合召回后再做重排，质量明显稳定了一些。"
          ]
        },
        {
          heading: "当前做法",
          paragraphs: [
            "离线阶段按语义段落优先切分，再限制 token 上限，避免硬切句子造成上下文断裂。",
            "在线阶段先做 query 改写，再走向量检索 + 关键词检索，最后用重排模型压缩结果集。"
          ]
        }
      ]
    },
    {
      slug: "react-server-components-migration",
      title: "⚛️ React Server Components 迁移实验",
      detailTitle: "⚛️ React Server Components 迁移实验",
      meta: "2026-04-15 · 前端性能",
      summary: "记录从客户端渲染迁移到 RSC 的过程，比较 LCP 与首屏可交互时间变化。",
      tags: ["React", "Next.js"],
      lead: "这次迁移不是为了追新，而是因为内容站点的首屏确实被客户端数据获取拖慢了。",
      sections: [
        {
          heading: "迁移动机",
          paragraphs: [
            "原页面把首屏列表、标签统计和推荐模块都放在客户端请求，导致首屏完整内容依赖多个接口返回。",
            "RSC 更适合这类读多写少的内容页面，能把数据拼装放回服务端。"
          ]
        },
        {
          heading: "迁移过程",
          paragraphs: [
            "我先把纯展示型组件迁到 Server Component，再把必须交互的筛选器和收藏按钮留在 Client Component。",
            "这一步的关键不是全量替换，而是先划清哪些组件真的需要浏览器状态。"
          ]
        },
        {
          heading: "结果",
          paragraphs: [
            "LCP 有明显改善，首屏可交互时间也更稳定，但缓存边界和组件职责需要更严格地管理。",
            "结论是：RSC 值得用，但只适合内容组织清楚的页面。"
          ]
        }
      ]
    },
    {
      slug: "typescript-type-patterns",
      title: "🔧 TypeScript 类型体操实用模式",
      detailTitle: "🔧 TypeScript 类型体操实用模式",
      meta: "2026-04-03 · 语言基础",
      summary: "整理 5 个高频类型推导模式，减少复杂泛型带来的维护成本。",
      tags: ["TypeScript", "工程化"],
      lead: "类型体操最容易犯的错不是写不出来，而是写出一堆未来谁都不敢改的类型魔法。",
      sections: [
        {
          heading: "高频模式",
          paragraphs: [
            "我这次重点收口了三个最常用的方向：从配置对象推导结果类型、从函数签名抽取参数类型、在联合类型里做键名过滤。",
            "这些模式足够覆盖大部分业务代码，不需要每次都上复杂条件类型套娃。"
          ]
        },
        {
          heading: "踩坑",
          paragraphs: [
            "一旦类型定义依赖太多中间别名，阅读成本会迅速上升。团队里大部分人不会去调试类型系统。",
            "所以类型技巧必须服务于可读性，而不是炫技。"
          ]
        }
      ]
    }
  ],
  projects: [
    {
      slug: "ai-book-notes-assistant",
      title: "🤖 AI 读书笔记助手",
      detailTitle: "🤖 AI 读书笔记助手",
      meta: "状态：进行中 · 技术栈：FastAPI + LangChain",
      summary: "支持上传 PDF 自动提取章节要点，并在右侧展示基于知识库的问答结果。",
      tags: ["FastAPI", "RAG", "ChromaDB"],
      lead: "这个项目的目标不是做一个聊天框，而是把读书过程里的整理、追问和复盘串起来。",
      sections: [
        {
          heading: "当前功能",
          paragraphs: [
            "支持上传 PDF 后自动抽取章节结构、摘要和关键词，并建立按书籍隔离的知识库。",
            "问答区会优先引用当前书籍内容，避免回答跑偏成泛知识聊天。"
          ]
        },
        {
          heading: "技术重点",
          paragraphs: [
            "后端用 FastAPI 管文件上传和任务调度，LangChain 负责文档处理链路，ChromaDB 先作为轻量向量库使用。",
            "目前最花时间的是检索质量和引用片段展示，而不是模型调用本身。"
          ]
        },
        {
          heading: "下一步",
          paragraphs: [
            "准备补章节级阅读进度和问题历史，后面再做书与书之间的跨文档对比。",
            "如果这两块稳定下来，再考虑做分享页。"
          ]
        }
      ]
    },
    {
      slug: "study-progress-tracker",
      title: "📊 学习进度追踪器",
      detailTitle: "📊 学习进度追踪器",
      meta: "状态：已上线 · 技术栈：React + Recharts",
      summary: "可视化统计每日学习时长与主题分布，自动生成周报并导出。",
      tags: ["React", "数据可视化"],
      lead: "这个项目主要解决一个老问题：学了很多，但过一周就说不清时间到底花在哪。",
      sections: [
        {
          heading: "核心价值",
          paragraphs: [
            "把每天的学习记录转成周维度和主题维度的图表，能很直观看出投入分布。",
            "相比纯待办，这类时间轨迹对复盘更有用。"
          ]
        },
        {
          heading: "实现方式",
          paragraphs: [
            "前端用 React 做录入和展示，图表部分用 Recharts，导出周报时会生成一段可直接复用的总结文本。",
            "设计上尽量保持输入简单，不然用户很快就不愿意记。"
          ]
        }
      ]
    },
    {
      slug: "cli-task-system",
      title: "⌨️ 命令行任务系统",
      detailTitle: "⌨️ 命令行任务系统",
      meta: "状态：已完成 · 技术栈：Python + Click",
      summary: "实现优先级、标签和提醒功能，支持在 Windows 终端快速管理待办。",
      tags: ["Python", "CLI"],
      lead: "这是一个很偏个人使用的工具，但也逼我把命令行产品的交互边界想清楚了。",
      sections: [
        {
          heading: "做了什么",
          paragraphs: [
            "支持任务新增、筛选、排序、提醒和标签分类，基本覆盖日常命令行待办场景。",
            "为了方便快速查看，输出格式尽量稳定，颜色和字段顺序都比较克制。"
          ]
        },
        {
          heading: "复盘",
          paragraphs: [
            "CLI 工具最怕参数体系越长越乱，所以我后期砍掉了不少看起来很全、但实际没人会用的选项。",
            "做完以后更确定一件事：功能多不等于体验好。"
          ]
        }
      ]
    }
  ],
  reading: [
    {
      slug: "designing-data-intensive-applications",
      title: "📖 Designing Data-Intensive Applications",
      detailTitle: "📖 Designing Data-Intensive Applications",
      sub: "在读中",
      summary: "重点学习复制、一致性与分布式系统设计中的取舍。",
      tags: ["分布式系统", "一致性", "系统设计"],
      lead: "这本书的价值不在于给结论，而在于把系统设计中的取舍讲得很诚实。",
      sections: [
        {
          heading: "当前关注",
          paragraphs: [
            "我最近重点看复制、一致性和日志系统相关章节，因为这些知识直接影响后面系统设计学习的地基。",
            "之前很多概念是散着记的，看这本书以后才开始连成体系。"
          ]
        },
        {
          heading: "读书方式",
          paragraphs: [
            "现在不会再试图一次全读完，而是按主题拆着读，读完一块就写一小段笔记。",
            "这样比机械打卡更容易留下真正能复用的理解。"
          ]
        }
      ]
    },
    {
      slug: "the-pragmatic-programmer",
      title: "🛠️ The Pragmatic Programmer",
      detailTitle: "🛠️ The Pragmatic Programmer",
      sub: "已读",
      summary: "持续提醒自己：先修复坏味道，再扩展功能。",
      tags: ["工程实践", "重构", "职业习惯"],
      lead: "这本书不是讲某个技术点，而是在不断提醒开发者别把坏习惯工程化。",
      sections: [
        {
          heading: "最大的提醒",
          paragraphs: [
            "最有价值的不是某条技巧，而是它一直强调：看到问题就应该在能力范围内顺手修一点。",
            "代码不会自己变好，放着不管只会继续腐烂。"
          ]
        }
      ]
    },
    {
      slug: "a-philosophy-of-software-design",
      title: "🧩 A Philosophy of Software Design",
      detailTitle: "🧩 A Philosophy of Software Design",
      sub: "已读",
      summary: "“Deep modules” 对接口设计影响很大，后续会持续实践。",
      tags: ["模块设计", "接口设计"],
      lead: "这本书让我更警惕一件事：接口看起来很薄，不代表设计就简单。",
      sections: [
        {
          heading: "核心收获",
          paragraphs: [
            "“Deep modules” 这个概念对我影响很大，逼着我重新审视自己写的 helper 和 service 到底是在收敛复杂度，还是只是在转移复杂度。",
            "后面做模块拆分时，我会更关注接口是否真正减少了调用方负担。"
          ]
        }
      ]
    }
  ],
  now: [
    {
      slug: "ai-engineering-focus",
      title: "🧪 AI 工程化持续推进",
      detailTitle: "🧪 AI 工程化持续推进",
      sub: "LangChain / LlamaIndex",
      summary: "重点在评估、监控和成本控制，不只停留在 API 调用层。",
      tags: ["AI 工程化", "评估", "成本控制"],
      lead: "最近的重点已经不是“怎么调用模型”，而是“怎么把模型接进可维护的系统里”。",
      sections: [
        {
          heading: "当前关注点",
          paragraphs: [
            "我现在更关注评估闭环、调用监控和成本控制，因为这些东西决定了一个 AI 功能能不能长期稳定用下去。",
            "纯 demo 阶段好看没用，上线后如果不可观测，迟早出问题。"
          ]
        }
      ]
    },
    {
      slug: "weekly-learning-notes",
      title: "✍️ 每周一篇学习笔记",
      detailTitle: "✍️ 每周一篇学习笔记",
      sub: "已连续 14 周",
      summary: "用输出倒逼输入，逼自己把概念讲清楚。",
      tags: ["写作", "复盘", "学习方法"],
      lead: "这个习惯看起来普通，但它是我最近最稳定的学习杠杆之一。",
      sections: [
        {
          heading: "为什么坚持",
          paragraphs: [
            "只输入不输出，很容易误以为自己懂了。写成笔记以后，漏洞会立刻暴露出来。",
            "我现在更愿意写短一点、但讲清楚，而不是堆很多泛泛而谈的内容。"
          ]
        }
      ]
    },
    {
      slug: "system-design-learning",
      title: "🏗️ 系统设计学习中",
      detailTitle: "🏗️ 系统设计学习中",
      sub: "入门阶段",
      summary: "正在补齐分布式、缓存一致性和故障恢复基础。",
      tags: ["系统设计", "分布式", "缓存"],
      lead: "系统设计这块不能靠背面经，基础没打牢，画再多图都只是表演。",
      sections: [
        {
          heading: "当前节奏",
          paragraphs: [
            "现在还是补基础为主，尤其是缓存一致性、故障恢复和容量估算这些看似枯燥、但最容易在面试和实战里翻车的内容。",
            "这部分我不准备追求速度，先把概念之间的关系理顺。"
          ]
        }
      ]
    }
  ]
};

export function getDefaultHash() {
  return `#/${DEFAULT_SECTION}`;
}

export function getRouteState(hash) {
  const normalized = String(hash || "").trim();
  if (!normalized) {
    return { type: "list", section: DEFAULT_SECTION, slug: null };
  }

  const path = normalized.replace(/^#\/?/, "").trim().toLowerCase();
  const [section, slug, ...rest] = path.split("/").filter(Boolean);

  if (!sections[section] || rest.length > 0) {
    return { type: "list", section: DEFAULT_SECTION, slug: null };
  }

  if (!slug) {
    return { type: "list", section, slug: null };
  }

  return { type: "detail", section, slug };
}

export function findItemBySlug(section, slug) {
  const items = contentBySection[section] || [];
  return items.find((item) => item.slug === slug) || null;
}
