import { useEffect, useMemo, useRef, useState } from "react";

import { renderMarkdownBody } from "../../data/content-model.js";
import { createImageTag, getTodayDate, parseTagsInput, slugifyTitle } from "../../data/editor-utils.js";

function buildPreviewMeta({ date, sectionLabel, tags }) {
  return [date, sectionLabel, tags.length ? tags.join(" 路 ") : ""].filter(Boolean).join(" 路 ");
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

export default function EditorPage({ sections, isDev }) {
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [form, setForm] = useState({
    section: "notes",
    title: "",
    slug: "",
    date: getTodayDate(),
    tags: "",
    summary: "",
    body: "",
    imageWidth: 480
  });

  useEffect(() => {
    if (slugTouched) {
      return;
    }

    setForm((current) => ({
      ...current,
      slug: slugifyTitle(current.title)
    }));
  }, [form.title, slugTouched]);

  const preview = useMemo(() => {
    const tags = parseTagsInput(form.tags);
    const { html } = renderMarkdownBody(form.body);

    return {
      html,
      tags,
      sectionLabel: sections[form.section]?.label || form.section,
      metaText: buildPreviewMeta({
        date: form.date,
        sectionLabel: sections[form.section]?.label || form.section,
        tags
      })
    };
  }, [form, sections]);

  if (!isDev) {
    return (
      <section className="editor-page route-panel">
        <header className="section-head">
          <h1>创建内容</h1>
        </header>
        <section className="empty-state">
          <h2>仅限本地开发环境</h2>
          <p>编辑器保存能力只在 `npm run dev` 下可用。</p>
        </section>
      </section>
    );
  }

  async function handleImageInsert() {
    const file = imageInputRef.current?.files?.[0];
    if (!file) {
      return;
    }

    try {
      setStatus({ message: "正在上传图片...", type: "pending" });
      const contentBase64 = await fileToBase64(file);
      const response = await fetch("/__local-api/content/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          section: form.section,
          fileName: file.name,
          contentBase64
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "图片上传失败");
      }

      const alt = window.prompt("图片说明", "") ?? "";
      const width = Number(form.imageWidth) || 480;
      const textarea = textareaRef.current;
      const insert = `\n\n${createImageTag({ src: result.src, alt, width })}\n\n`;

      if (!textarea) {
        setForm((current) => ({
          ...current,
          body: `${current.body}${insert}`
        }));
      } else {
        const start = textarea.selectionStart ?? textarea.value.length;
        const end = textarea.selectionEnd ?? textarea.value.length;

        setForm((current) => ({
          ...current,
          body: `${current.body.slice(0, start)}${insert}${current.body.slice(end)}`
        }));
      }

      setStatus({ message: "图片已插入编辑区", type: "success" });
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : "图片上传失败", type: "error" });
    } finally {
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  }

  async function handleSave() {
    const normalizedSlug = slugifyTitle(form.slug || form.title);

    if (!form.title.trim()) {
      setStatus({ message: "标题不能为空", type: "error" });
      return;
    }

    if (!form.body.trim()) {
      setStatus({ message: "正文不能为空", type: "error" });
      return;
    }

    setForm((current) => ({
      ...current,
      slug: normalizedSlug
    }));

    try {
      setStatus({ message: "正在保存...", type: "pending" });
      const response = await fetch("/__local-api/content/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          section: form.section,
          title: form.title.trim(),
          slug: normalizedSlug,
          date: form.date,
          summary: form.summary.trim(),
          tags: parseTagsInput(form.tags),
          body: form.body
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "保存失败");
      }

      setStatus({ message: result.message || "保存成功", type: "success" });
      window.location.hash = result.hash;
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : "保存失败", type: "error" });
    }
  }

  return (
    <section className="editor-page route-panel">
      <header className="editor-toolbar">
        <div className="editor-toolbar-main">
          <a className="detail-back" href="#/notes">
            返回笔记
          </a>
          <h1>创建内容</h1>
        </div>
        <div className="editor-toolbar-actions">
          <button type="button" className="pill pill-button" onClick={() => imageInputRef.current?.click()}>
            插入图片
          </button>
          <button type="button" className="pill pill-button pill-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </header>

      <div className="editor-meta-grid">
        <label className="editor-field">
          <span>栏目</span>
          <select value={form.section} onChange={(event) => setForm((current) => ({ ...current, section: event.target.value }))}>
            {Object.entries(sections).map(([sectionKey, meta]) => (
              <option key={sectionKey} value={sectionKey}>
                {meta.label}
              </option>
            ))}
          </select>
        </label>
        <label className="editor-field">
          <span>标题</span>
          <input
            type="text"
            placeholder="输入标题"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
        </label>
        <label className="editor-field">
          <span>slug</span>
          <input
            type="text"
            placeholder="自动生成或手动修改"
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setForm((current) => ({ ...current, slug: event.target.value }));
            }}
          />
        </label>
        <label className="editor-field">
          <span>日期</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
          />
        </label>
        <label className="editor-field">
          <span>标签</span>
          <input
            type="text"
            placeholder="AI, Markdown"
            value={form.tags}
            onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
          />
        </label>
        <label className="editor-field">
          <span>图片宽度</span>
          <input
            type="number"
            min="100"
            step="10"
            value={form.imageWidth}
            onChange={(event) => setForm((current) => ({ ...current, imageWidth: event.target.value }))}
          />
        </label>
        <label className="editor-field editor-field-full">
          <span>摘要</span>
          <textarea
            rows="2"
            placeholder="可选，留空则以后自动摘要"
            value={form.summary}
            onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
          />
        </label>
      </div>

      <p className="editor-status" data-type={status.type}>
        {status.message}
      </p>

      <div className="editor-split">
        <section className="editor-pane">
          <div className="editor-pane-head">Markdown</div>
          <textarea
            ref={textareaRef}
            className="editor-textarea"
            spellCheck="false"
            placeholder="在这里写 Markdown，右侧会实时预览"
            value={form.body}
            onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
          />
        </section>
        <section className="editor-pane">
          <div className="editor-pane-head">预览</div>
          <div className="editor-preview">
            <article className="detail-article editor-preview-article">
              <header className="detail-header">
                <p className="detail-section-name">{preview.sectionLabel}</p>
                <h1>{form.title.trim() || "未命名内容"}</h1>
                {preview.metaText ? <p className="detail-meta">{preview.metaText}</p> : null}
                {form.summary.trim() ? <p className="detail-lead">{form.summary.trim()}</p> : null}
              </header>
              <div className="detail-body markdown-body" dangerouslySetInnerHTML={{ __html: preview.html }} />
            </article>
          </div>
        </section>
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageInsert} />
    </section>
  );
}
