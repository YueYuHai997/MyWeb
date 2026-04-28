import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import markdown from "highlight.js/lib/languages/markdown";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import { marked } from "marked";
import { parse as parseYaml } from "yaml";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("md", markdown);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("sql", sql);

export const VALID_SECTIONS = ["notes", "projects", "reading", "now"];

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTags(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function normalizeOrder(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeDraft(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }

  return false;
}

function normalizeDate(value, sourcePath) {
  const text = normalizeText(value);
  if (!text) {
    return { date: "", timestamp: null };
  }

  const timestamp = Date.parse(text);
  if (Number.isNaN(timestamp)) {
    console.warn(`[content] Invalid date "${text}" in ${sourcePath}`);
    return { date: "", timestamp: null };
  }

  return { date: text, timestamp };
}

function extractFrontmatter(source) {
  const normalizedSource = String(source ?? "");
  const match = normalizedSource.match(FRONTMATTER_PATTERN);

  if (!match) {
    return {
      data: {},
      body: normalizedSource.trim()
    };
  }

  const data = parseYaml(match[1]) ?? {};
  if (typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Frontmatter must be an object");
  }

  return {
    data,
    body: normalizedSource.slice(match[0].length).trim()
  };
}

function stripMarkdown(source) {
  return String(source ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveSummary(body) {
  const plainText = stripMarkdown(body);
  if (!plainText) {
    return "";
  }

  return plainText.length > 120 ? `${plainText.slice(0, 120)}…` : plainText;
}

function parsePath(filePath) {
  const normalizedPath = String(filePath ?? "").replaceAll("\\", "/");
  const match = normalizedPath.match(/content\/([^/]+)\/([^/]+)\.md$/i);

  if (!match) {
    return null;
  }

  return {
    section: match[1],
    slug: match[2].toLowerCase(),
    sourcePath: normalizedPath
  };
}

function slugifyHeading(text) {
  const normalized = normalizeText(text)
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "section";
}

function createHeadingId(text, registry) {
  const base = slugifyHeading(text);
  const count = registry.get(base) ?? 0;
  registry.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function renderHighlightedCode(code, language) {
  const normalizedLanguage = normalizeText(language).toLowerCase();
  const className = normalizedLanguage ? `hljs language-${normalizedLanguage}` : "hljs";

  if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
    const highlighted = hljs.highlight(code, { language: normalizedLanguage }).value;
    return `<pre><code class="${className}">${highlighted}</code></pre>`;
  }

  const highlighted = hljs.highlightAuto(code).value;
  return `<pre><code class="${className}">${highlighted}</code></pre>`;
}

function buildHtmlAndToc(body) {
  const toc = [];
  const headingRegistry = new Map();
  const renderer = new marked.Renderer();

  renderer.heading = (token) => {
    const headingText = normalizeText(token.text);
    const headingId = createHeadingId(headingText, headingRegistry);
    const innerHtml = marked.Parser.parseInline(token.tokens);

    if (token.depth === 2 || token.depth === 3) {
      toc.push({
        id: headingId,
        text: headingText,
        level: token.depth
      });
    }

    return `<h${token.depth} id="${headingId}">${innerHtml}</h${token.depth}>`;
  };

  renderer.code = ({ text, lang }) => renderHighlightedCode(text, lang);

  return {
    html: marked.parse(body, {
      renderer,
      gfm: true,
      breaks: true
    }),
    toc
  };
}

export function renderMarkdownBody(body) {
  return buildHtmlAndToc(String(body ?? ""));
}

function sortItems(left, right) {
  if (left.order !== null || right.order !== null) {
    if (left.order === null) {
      return 1;
    }

    if (right.order === null) {
      return -1;
    }

    if (left.order !== right.order) {
      return left.order - right.order;
    }
  }

  if (left.timestamp !== null || right.timestamp !== null) {
    if (left.timestamp === null) {
      return 1;
    }

    if (right.timestamp === null) {
      return -1;
    }

    if (left.timestamp !== right.timestamp) {
      return right.timestamp - left.timestamp;
    }
  }

  return left.slug.localeCompare(right.slug, "zh-CN");
}

export function parseMarkdownDocument(section, slug, source, sourcePath = "") {
  const { data, body } = extractFrontmatter(source);
  const title = normalizeText(data.title);

  if (!title) {
    throw new Error(`Missing required "title" in ${sourcePath || `${section}/${slug}`}`);
  }

  const { date, timestamp } = normalizeDate(data.date, sourcePath || `${section}/${slug}`);
  const summary = normalizeText(data.summary) || deriveSummary(body);
  const sub = normalizeText(data.sub);
  const status = normalizeText(data.status);
  const { html, toc } = renderMarkdownBody(body);

  return {
    section,
    slug,
    title,
    detailTitle: title,
    summary,
    lead: summary,
    cover: normalizeText(data.cover),
    html,
    toc,
    tags: normalizeTags(data.tags),
    sub,
    status,
    order: normalizeOrder(data.order),
    draft: normalizeDraft(data.draft),
    date,
    timestamp,
    sourcePath
  };
}

export function buildContentIndex(modules) {
  const index = Object.fromEntries(VALID_SECTIONS.map((section) => [section, []]));
  const slugRegistry = new Set();

  Object.entries(modules ?? {}).forEach(([filePath, source]) => {
    const parsedPath = parsePath(filePath);
    if (!parsedPath || !VALID_SECTIONS.includes(parsedPath.section)) {
      return;
    }

    const { section, slug, sourcePath } = parsedPath;
    const slugKey = `${section}:${slug}`;

    if (slugRegistry.has(slugKey)) {
      throw new Error(`Duplicate slug "${slug}" in section "${section}"`);
    }

    const item = parseMarkdownDocument(section, slug, source, sourcePath);
    slugRegistry.add(slugKey);

    if (!item.draft) {
      index[section].push(item);
    }
  });

  VALID_SECTIONS.forEach((section) => {
    index[section].sort(sortItems);
  });

  return index;
}
