import {
  SITE_NAME,
  sections,
  getSectionDescription,
  getSectionNavigationItems,
  getDefaultHash,
  getRouteState,
  findItemBySlug
} from "./site-data.mjs";
import { contentBySection } from "./site-content.mjs";
import { mountEditorPage, renderEditorPage } from "./editor-page.mjs";

const appNode = document.querySelector("#app");
const isDev = import.meta.env.DEV;
let revealObserver = null;

function buildListHash(section) {
  return `#/${section}`;
}

function buildDetailHash(section, slug) {
  return `#/${section}/${slug}`;
}

function getNormalizedRouteState() {
  const rawHash = window.location.hash.trim();
  if (!rawHash) {
    const defaultHash = getDefaultHash();
    window.history.replaceState(null, "", defaultHash);
    return getRouteState(defaultHash);
  }

  const state = getRouteState(rawHash);
  let normalizedHash = buildListHash(state.section);

  if (state.type === "detail") {
    normalizedHash = buildDetailHash(state.section, state.slug);
  } else if (state.type === "editor") {
    normalizedHash = "#/editor";
  }

  if (rawHash !== normalizedHash) {
    window.history.replaceState(null, "", normalizedHash);
  }

  return state;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderTags(tags) {
  if (!tags?.length) {
    return "";
  }

  return `
    <div class="post-tags detail-tags">
      ${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function buildMetaText(item) {
  return [item.date, item.status, item.sub].filter(Boolean).join(" · ");
}

function renderEmptyState(sectionMeta) {
  return `
    <section class="empty-state">
      <h2>${escapeHtml(sectionMeta.title)}</h2>
      <p>当前还没有内容，后续直接往对应的 Markdown 目录添加文件即可。</p>
    </section>
  `;
}

function renderPostList(section, items) {
  if (!items.length) {
    return renderEmptyState(sections[section]);
  }

  const posts = items
    .map((item) => {
      const metaText = buildMetaText(item);
      return `
        <li class="post-item reveal-item">
          <a class="entry-link" href="${escapeHtml(buildDetailHash(section, item.slug))}">
            <h2 class="post-title">${escapeHtml(item.title)}</h2>
            ${metaText ? `<p class="post-meta">${escapeHtml(metaText)}</p>` : ""}
            <p class="post-body">${escapeHtml(item.summary)}</p>
            ${renderTags(item.tags)}
          </a>
        </li>
      `;
    })
    .join("");

  return `<ul class="post-list">${posts}</ul>`;
}

function renderContextSection(title, subtitle, itemsHtml) {
  return `
    <aside class="context-panel">
      <div class="context-panel-inner">
        <p class="context-eyebrow">${escapeHtml(subtitle)}</p>
        <h2 class="context-title">${escapeHtml(title)}</h2>
        <div class="context-nav">
          ${itemsHtml}
        </div>
      </div>
    </aside>
  `;
}

function renderSectionContextNav(section) {
  const items = getSectionNavigationItems(contentBySection, section);
  const itemsHtml = items.length
    ? items
        .map(
          (item, index) => `
            <a class="context-link" href="${escapeHtml(buildDetailHash(section, item.slug))}">
              <span class="context-index">${String(index + 1).padStart(2, "0")}</span>
              <span class="context-label">${escapeHtml(item.title)}</span>
            </a>
          `
        )
        .join("")
    : `<p class="context-empty">当前栏目还没有文章。</p>`;

  return renderContextSection("本栏文章", sections[section].label, itemsHtml);
}

function renderArticleContextNav(item) {
  const itemsHtml = item.toc?.length
    ? item.toc
        .map(
          (heading) => `
            <button
              type="button"
              class="context-link context-link-button context-level-${heading.level}"
              data-heading-id="${escapeHtml(heading.id)}"
            >
              <span class="context-label">${escapeHtml(heading.text)}</span>
            </button>
          `
        )
        .join("")
    : `<p class="context-empty">这篇文章还没有二级标题目录。</p>`;

  return renderContextSection("文章目录", item.title, itemsHtml);
}

function renderListPage(section) {
  const sectionMeta = sections[section];
  const items = contentBySection[section] || [];

  return {
    pageTitle: `${sectionMeta.label} - ${SITE_NAME}`,
    layout: "content",
    main: `
      <section class="route-panel">
        <header class="section-head">
          <h1>${escapeHtml(`${sectionMeta.icon} ${sectionMeta.title}`)}</h1>
          <span class="section-desc">${escapeHtml(getSectionDescription(section, contentBySection))}</span>
        </header>
        ${renderPostList(section, items)}
      </section>
    `,
    context: renderSectionContextNav(section)
  };
}

function renderDetailPage(section, item) {
  const sectionMeta = sections[section];
  const metaText = buildMetaText(item);

  return {
    pageTitle: `${item.detailTitle} - ${SITE_NAME}`,
    layout: "content",
    main: `
      <article class="route-panel detail-article">
        <a class="detail-back" href="${escapeHtml(buildListHash(section))}">
          返回${escapeHtml(sectionMeta.label)}
        </a>
        <header class="detail-header">
          <p class="detail-section-name">${escapeHtml(`${sectionMeta.icon} ${sectionMeta.navLabel}`)}</p>
          <h1>${escapeHtml(item.detailTitle)}</h1>
          ${metaText ? `<p class="detail-meta">${escapeHtml(metaText)}</p>` : ""}
          ${item.lead ? `<p class="detail-lead">${escapeHtml(item.lead)}</p>` : ""}
          ${renderTags(item.tags)}
        </header>
        <div class="detail-body markdown-body">
          ${item.html}
        </div>
      </article>
    `,
    context: renderArticleContextNav(item)
  };
}

function renderLayout(view, activeRoute) {
  if (!appNode) {
    return;
  }

  const body =
    view.layout === "editor"
      ? `${view.main}`
      : `
        <div class="content-shell">
          <div class="content-main">
            ${view.main}
          </div>
          ${view.context}
        </div>
      `;

  appNode.innerHTML = `
    ${body}
    <footer class="content-footer">
      <span>${escapeHtml(SITE_NAME)}</span>
      <span>&copy; <span data-year></span></span>
    </footer>
  `;

  document.title = view.pageTitle;
  updateActiveNav(activeRoute);
  updateYear();
  initRevealAnimation();
  bindContextHeadingNavigation();

  if (view.layout === "editor") {
    mountEditorPage({ sections });
  }
}

function updateActiveNav(routeKey) {
  document.querySelectorAll("[data-route]").forEach((node) => {
    const isActive = node.getAttribute("data-route") === routeKey;
    if (isActive) {
      node.setAttribute("aria-current", "page");
    } else {
      node.removeAttribute("aria-current");
    }
  });
}

function toggleDevOnlyElements() {
  if (isDev) {
    return;
  }

  document.querySelectorAll("[data-dev-only]").forEach((node) => {
    node.remove();
  });
}

function bindContextHeadingNavigation() {
  document.querySelectorAll("[data-heading-id]").forEach((node) => {
    node.addEventListener("click", () => {
      const headingId = node.getAttribute("data-heading-id");
      if (!headingId) {
        return;
      }

      const target = document.getElementById(headingId);
      if (!target) {
        return;
      }

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
}

function initRevealAnimation() {
  if (revealObserver) {
    revealObserver.disconnect();
  }

  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const delay = Number(entry.target.dataset.delay || 0);
        window.setTimeout(() => {
          entry.target.classList.add("visible");
        }, delay);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08 }
  );

  document.querySelectorAll(".reveal-item").forEach((node, index) => {
    node.classList.remove("visible");
    node.dataset.delay = `${index * 50}`;
    revealObserver.observe(node);
  });
}

function updateYear() {
  const yearNode = document.querySelector("[data-year]");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

function handleRouteChange() {
  const state = getNormalizedRouteState();

  if (state.type === "editor") {
    renderLayout(renderEditorPage(sections, isDev), "editor");
    return;
  }

  if (state.type === "detail") {
    const item = findItemBySlug(contentBySection, state.section, state.slug);
    if (!item) {
      const fallbackHash = buildListHash(state.section);
      window.history.replaceState(null, "", fallbackHash);
      renderLayout(renderListPage(state.section), state.section);
      return;
    }

    renderLayout(renderDetailPage(state.section, item), state.section);
    return;
  }

  renderLayout(renderListPage(state.section), state.section);
}

toggleDevOnlyElements();
window.addEventListener("hashchange", handleRouteChange);
handleRouteChange();
