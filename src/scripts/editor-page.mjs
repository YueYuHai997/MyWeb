import { renderMarkdownBody } from "./content-model.mjs";
import {
  createImageTag,
  getTodayDate,
  parseTagsInput,
  slugifyTitle
} from "./editor-utils.mjs";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildPreviewMeta({ date, sectionLabel, tags }) {
  return [date, sectionLabel, tags.length ? tags.join(" · ") : ""].filter(Boolean).join(" · ");
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.split(",")[1] || "");
    };

    reader.readAsDataURL(file);
  });
}

function insertTextAtCursor(textarea, text) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);

  textarea.value = `${before}${text}${after}`;
  const nextCursor = start + text.length;
  textarea.selectionStart = nextCursor;
  textarea.selectionEnd = nextCursor;
  textarea.focus();
}

export function renderEditorPage(sections, isDev) {
  if (!isDev) {
    return {
      title: "创建内容",
      pageTitle: "创建内容",
      layout: "editor",
      main: `
        <section class="editor-page route-panel">
          <header class="section-head">
            <h1>创建内容</h1>
          </header>
          <section class="empty-state">
            <h2>仅限本地开发环境</h2>
            <p>编辑器保存能力只在 \`npm run dev\` 下可用。</p>
          </section>
        </section>
      `
    };
  }

  const optionsHtml = Object.entries(sections)
    .map(([sectionKey, meta]) => `<option value="${escapeHtml(sectionKey)}">${escapeHtml(meta.label)}</option>`)
    .join("");

  return {
    title: "创建内容",
    pageTitle: "创建内容",
    layout: "editor",
    main: `
      <section class="editor-page route-panel">
        <header class="editor-toolbar">
          <div class="editor-toolbar-main">
            <a class="detail-back" href="#/notes">返回笔记</a>
            <h1>创建内容</h1>
          </div>
          <div class="editor-toolbar-actions">
            <button type="button" class="pill pill-button" id="editor-insert-image">插入图片</button>
            <button type="button" class="pill pill-button pill-primary" id="editor-save">保存</button>
          </div>
        </header>

        <div class="editor-meta-grid">
          <label class="editor-field">
            <span>栏目</span>
            <select id="editor-section">${optionsHtml}</select>
          </label>
          <label class="editor-field">
            <span>标题</span>
            <input id="editor-title" type="text" placeholder="输入标题" />
          </label>
          <label class="editor-field">
            <span>slug</span>
            <input id="editor-slug" type="text" placeholder="自动生成或手动修改" />
          </label>
          <label class="editor-field">
            <span>日期</span>
            <input id="editor-date" type="date" value="${escapeHtml(getTodayDate())}" />
          </label>
          <label class="editor-field">
            <span>标签</span>
            <input id="editor-tags" type="text" placeholder="AI, Markdown" />
          </label>
          <label class="editor-field">
            <span>图片宽度</span>
            <input id="editor-image-width" type="number" min="100" step="10" value="480" />
          </label>
          <label class="editor-field editor-field-full">
            <span>摘要</span>
            <textarea id="editor-summary" rows="2" placeholder="可选，留空则以后自动摘要"></textarea>
          </label>
        </div>

        <p class="editor-status" id="editor-status"></p>

        <div class="editor-split">
          <section class="editor-pane">
            <div class="editor-pane-head">Markdown</div>
            <textarea
              id="editor-body"
              class="editor-textarea"
              spellcheck="false"
              placeholder="在这里写 Markdown，右侧会实时预览"
            ></textarea>
          </section>
          <section class="editor-pane">
            <div class="editor-pane-head">预览</div>
            <div id="editor-preview" class="editor-preview"></div>
          </section>
        </div>

        <input id="editor-image-input" type="file" accept="image/*" hidden />
      </section>
    `
  };
}

export function mountEditorPage({ sections }) {
  const sectionInput = document.querySelector("#editor-section");
  const titleInput = document.querySelector("#editor-title");
  const slugInput = document.querySelector("#editor-slug");
  const dateInput = document.querySelector("#editor-date");
  const tagsInput = document.querySelector("#editor-tags");
  const summaryInput = document.querySelector("#editor-summary");
  const bodyInput = document.querySelector("#editor-body");
  const imageWidthInput = document.querySelector("#editor-image-width");
  const previewNode = document.querySelector("#editor-preview");
  const statusNode = document.querySelector("#editor-status");
  const saveButton = document.querySelector("#editor-save");
  const insertImageButton = document.querySelector("#editor-insert-image");
  const imageInput = document.querySelector("#editor-image-input");

  if (
    !sectionInput ||
    !titleInput ||
    !slugInput ||
    !dateInput ||
    !tagsInput ||
    !summaryInput ||
    !bodyInput ||
    !imageWidthInput ||
    !previewNode ||
    !statusNode ||
    !saveButton ||
    !insertImageButton ||
    !imageInput
  ) {
    return;
  }

  let slugTouched = false;

  const updateStatus = (message, type = "") => {
    statusNode.textContent = message;
    statusNode.dataset.type = type;
  };

  const getFormState = () => {
    const tags = parseTagsInput(tagsInput.value);
    return {
      section: sectionInput.value,
      sectionLabel: sections[sectionInput.value]?.label || sectionInput.value,
      title: titleInput.value.trim(),
      slug: slugInput.value.trim(),
      date: dateInput.value,
      summary: summaryInput.value.trim(),
      tags,
      body: bodyInput.value
    };
  };

  const renderPreview = () => {
    const state = getFormState();
    const { html } = renderMarkdownBody(state.body);
    const metaText = buildPreviewMeta(state);

    previewNode.innerHTML = `
      <article class="detail-article editor-preview-article">
        <header class="detail-header">
          <p class="detail-section-name">${escapeHtml(state.sectionLabel)}</p>
          <h1>${escapeHtml(state.title || "未命名内容")}</h1>
          ${metaText ? `<p class="detail-meta">${escapeHtml(metaText)}</p>` : ""}
          ${state.summary ? `<p class="detail-lead">${escapeHtml(state.summary)}</p>` : ""}
        </header>
        <div class="detail-body markdown-body">
          ${html}
        </div>
      </article>
    `;
  };

  const maybeSyncSlug = () => {
    if (slugTouched) {
      return;
    }

    slugInput.value = slugifyTitle(titleInput.value);
  };

  titleInput.addEventListener("input", () => {
    maybeSyncSlug();
    renderPreview();
  });

  slugInput.addEventListener("input", () => {
    slugTouched = true;
  });

  [sectionInput, dateInput, tagsInput, summaryInput, bodyInput].forEach((node) => {
    node.addEventListener("input", renderPreview);
    node.addEventListener("change", renderPreview);
  });

  insertImageButton.addEventListener("click", () => {
    imageInput.click();
  });

  imageInput.addEventListener("change", async () => {
    const file = imageInput.files?.[0];
    if (!file) {
      return;
    }

    try {
      updateStatus("正在上传图片...", "pending");
      const contentBase64 = await fileToBase64(file);
      const response = await fetch("/__local-api/content/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          section: sectionInput.value,
          fileName: file.name,
          contentBase64
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "图片上传失败");
      }

      const alt = window.prompt("图片说明", "") ?? "";
      const width = Number(imageWidthInput.value) || 480;
      insertTextAtCursor(
        bodyInput,
        `\n\n${createImageTag({ src: result.src, alt, width })}\n\n`
      );
      renderPreview();
      updateStatus("图片已插入编辑区", "success");
    } catch (error) {
      updateStatus(error instanceof Error ? error.message : "图片上传失败", "error");
    } finally {
      imageInput.value = "";
    }
  });

  saveButton.addEventListener("click", async () => {
    const state = getFormState();
    const normalizedSlug = slugifyTitle(state.slug || state.title);

    if (!state.title) {
      updateStatus("标题不能为空", "error");
      return;
    }

    if (!state.body.trim()) {
      updateStatus("正文不能为空", "error");
      return;
    }

    slugInput.value = normalizedSlug;

    try {
      updateStatus("正在保存...", "pending");
      const response = await fetch("/__local-api/content/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          section: state.section,
          title: state.title,
          slug: normalizedSlug,
          date: state.date,
          summary: state.summary,
          tags: state.tags,
          body: state.body
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "保存失败");
      }

      updateStatus(result.message || "保存成功", "success");
      window.location.hash = result.hash;
    } catch (error) {
      updateStatus(error instanceof Error ? error.message : "保存失败", "error");
    }
  });

  renderPreview();
}
