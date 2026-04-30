import { VALID_SECTIONS, buildContentIndex } from "./content-model.js";

export const SITE_NAME = "我の编程笔记";
export const DEFAULT_SECTION = "notes";
const APP_BASE_URL = import.meta.env?.BASE_URL || "/";

function resolvePublicAssetUrl(path, basePath = APP_BASE_URL) {
  const normalizedPath = typeof path === "string" ? path.trim() : "";

  if (
    !normalizedPath ||
    !normalizedPath.startsWith("/") ||
    normalizedPath.startsWith("//") ||
    /^[a-z][a-z\d+\-.]*:/i.test(normalizedPath)
  ) {
    return normalizedPath;
  }

  const normalizedBasePath = String(basePath || "/").trim();
  if (!normalizedBasePath || normalizedBasePath === "/") {
    return normalizedPath;
  }

  const basePrefix = normalizedBasePath.endsWith("/") ? normalizedBasePath : `${normalizedBasePath}/`;
  return `${basePrefix}${normalizedPath.slice(1)}`;
}

export const sections = {
  notes: {
    label: "学习笔记",
    navLabel: "学习笔记",
    title: "学习笔记",
    icon: "📝",
    listLayout: "post-list",
    describe(count) {
      return `共 ${count} 篇`;
    }
  },
  projects: {
    label: "项目",
    navLabel: "项目",
    title: "项目",
    icon: "🧪",
    listLayout: "post-list",
    describe(count) {
      return `共 ${count} 个`;
    }
  },
  reading: {
    label: "分享",
    navLabel: "分享",
    title: "分享",
    icon: "📚",
    listLayout: "post-list",
    describe(count) {
      return `共 ${count} 条`;
    }
  },
  now: {
    label: "近况",
    navLabel: "近况",
    title: "近况",
    icon: "🌱",
    listLayout: "post-list",
    describe(count) {
      return `共 ${count} 条`;
    }
  }
};

export function createContentBySection(markdownModules) {
  return buildContentIndex(markdownModules);
}

export function getSectionDescription(section, contentBySection) {
  const sectionMeta = sections[section];
  const count = contentBySection[section]?.length ?? 0;
  return sectionMeta?.describe ? sectionMeta.describe(count) : "";
}

export function getSectionNavigationItems(contentBySection, section) {
  return (contentBySection[section] || []).map((item) => ({
    slug: item.slug,
    title: item.title
  }));
}

export function getProjectGalleryItems(items, basePath = APP_BASE_URL) {
  return (items || [])
    .filter((item) => item.cover)
    .map((item) => ({
      image: resolvePublicAssetUrl(item.cover, basePath),
      text: item.title,
      href: `#/projects/${item.slug}`
    }));
}

export function getDefaultHash() {
  return `#/${DEFAULT_SECTION}`;
}

export function getRouteState(hash) {
  const normalized = String(hash || "").trim();
  if (!normalized) {
    return { type: "list", section: DEFAULT_SECTION, slug: null };
  }

  const path = normalized.replace(/^#\/?/, "").trim().toLowerCase();
  const [first, second, ...rest] = path.split("/").filter(Boolean);

  if (!VALID_SECTIONS.includes(first) || rest.length > 0) {
    return { type: "list", section: DEFAULT_SECTION, slug: null };
  }

  if (!second) {
    return { type: "list", section: first, slug: null };
  }

  return { type: "detail", section: first, slug: second };
}

export function findItemBySlug(contentBySection, section, slug) {
  const items = contentBySection[section] || [];
  return items.find((item) => item.slug === slug) || null;
}
