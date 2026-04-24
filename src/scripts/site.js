import {
  SITE_NAME,
  sections,
  contentBySection,
  getDefaultHash,
  getRouteState,
  findItemBySlug
} from "./site-data.mjs";

const appNode = document.querySelector("#app");
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
  const normalizedHash =
    state.type === "detail"
      ? buildDetailHash(state.section, state.slug)
      : buildListHash(state.section);

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

function renderPostList(section, items) {
  const posts = items
    .map(
      (item) => `
        <li class="post-item reveal-item">
          <a class="entry-link" href="${escapeHtml(buildDetailHash(section, item.slug))}">
            <h2 class="post-title">${escapeHtml(item.title)}</h2>
            <p class="post-meta">${escapeHtml(item.meta)}</p>
            <p class="post-body">${escapeHtml(item.summary)}</p>
            ${renderTags(item.tags)}
          </a>
        </li>
      `
    )
    .join("");

  return `<ul class="post-list">${posts}</ul>`;
}

function renderInsetList(section, items) {
  const cards = items
    .map(
      (item) => `
        <article class="inset-item reveal-item">
          <a class="entry-link entry-link-inset" href="${escapeHtml(buildDetailHash(section, item.slug))}">
            <h2 class="inset-title">${escapeHtml(item.title)}</h2>
            <p class="inset-sub">${escapeHtml(item.sub)}</p>
            <p class="inset-desc">${escapeHtml(item.summary)}</p>
          </a>
        </article>
      `
    )
    .join("");

  return `<section class="inset">${cards}</section>`;
}

function renderListPage(section) {
  const sectionMeta = sections[section];
  const items = contentBySection[section] || [];
  const body =
    sectionMeta.listLayout === "post-list"
      ? renderPostList(section, items)
      : renderInsetList(section, items);

  return {
    title: sectionMeta.title,
    pageTitle: `${sectionMeta.label} - ${SITE_NAME}`,
    body: `
      <section class="route-panel">
        <header class="section-head">
          <h1>${escapeHtml(sectionMeta.title)}</h1>
          <span class="section-desc">${escapeHtml(sectionMeta.description)}</span>
        </header>
        ${body}
      </section>
    `
  };
}

function renderDetailSections(item) {
  return item.sections
    .map(
      (section) => `
        <section class="detail-section">
          <h2>${escapeHtml(section.heading)}</h2>
          ${section.paragraphs
            .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
            .join("")}
        </section>
      `
    )
    .join("");
}

function renderDetailPage(section, item) {
  const sectionMeta = sections[section];
  const metaText = item.meta || item.sub || "";

  return {
    title: item.detailTitle,
    pageTitle: `${item.detailTitle} - ${SITE_NAME}`,
    body: `
      <article class="route-panel detail-article">
        <a class="detail-back" href="${escapeHtml(buildListHash(section))}">
          ← 返回${escapeHtml(sectionMeta.label)}
        </a>
        <header class="detail-header">
          <p class="detail-section-name">${escapeHtml(sectionMeta.navLabel)}</p>
          <h1>${escapeHtml(item.detailTitle)}</h1>
          <p class="detail-meta">${escapeHtml(metaText)}</p>
          <p class="detail-lead">${escapeHtml(item.lead)}</p>
          ${renderTags(item.tags)}
        </header>
        <div class="detail-body">
          ${renderDetailSections(item)}
        </div>
      </article>
    `
  };
}

function renderLayout(view, activeSection) {
  if (!appNode) {
    return;
  }

  appNode.innerHTML = `
    ${view.body}
    <footer class="content-footer">
      <span>${SITE_NAME}</span>
      <span>© <span data-year></span></span>
    </footer>
  `;

  document.title = view.pageTitle;
  updateActiveNav(activeSection);
  updateYear();
  initRevealAnimation();
}

function updateActiveNav(section) {
  document.querySelectorAll("[data-route]").forEach((node) => {
    const isActive = node.getAttribute("data-route") === section;
    if (isActive) {
      node.setAttribute("aria-current", "page");
    } else {
      node.removeAttribute("aria-current");
    }
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

  if (state.type === "detail") {
    const item = findItemBySlug(state.section, state.slug);
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

window.addEventListener("hashchange", handleRouteChange);

handleRouteChange();
