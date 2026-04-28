const INVALID_FILE_CHARS_PATTERN = /[<>:"/\\|?*\u0000-\u001F]/g;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeAttribute(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function slugifyTitle(title) {
  const normalized = normalizeText(title)
    .toLowerCase()
    .replace(INVALID_FILE_CHARS_PATTERN, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "note";
}

export function parseTagsInput(value) {
  return String(value ?? "")
    .split(/[,\n]/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

export function buildMarkdownFile({ title, date, summary, tags, draft = false, body }) {
  const lines = [
    `title: ${JSON.stringify(normalizeText(title))}`,
    `date: ${JSON.stringify(normalizeText(date))}`,
    `draft: ${draft ? "true" : "false"}`
  ];
  const normalizedSummary = normalizeText(summary);
  const normalizedTags = Array.isArray(tags) ? tags.map((item) => normalizeText(item)).filter(Boolean) : [];

  if (normalizedSummary) {
    lines.push(`summary: ${JSON.stringify(normalizedSummary)}`);
  }

  if (normalizedTags.length) {
    lines.push("tags:");
    normalizedTags.forEach((tag) => {
      lines.push(`  - ${JSON.stringify(tag)}`);
    });
  }

  const normalizedBody = String(body ?? "").replace(/\r\n/g, "\n").trim();

  return `---\n${lines.join("\n")}\n---\n\n${normalizedBody}\n`;
}

export function createImageTag({ src, alt = "", width }) {
  const normalizedSrc = normalizeText(src);
  const normalizedAlt = normalizeText(alt);
  const widthValue = Number(width);
  const widthAttribute = Number.isFinite(widthValue) && widthValue > 0 ? ` width="${widthValue}"` : "";

  return `<img src="${escapeAttribute(normalizedSrc)}" alt="${escapeAttribute(normalizedAlt)}"${widthAttribute} />`;
}

export function createAssetFileName(originalName, stamp = "") {
  const normalizedName = normalizeText(originalName);
  const lastDotIndex = normalizedName.lastIndexOf(".");
  const extension = lastDotIndex >= 0 ? normalizedName.slice(lastDotIndex).toLowerCase() : "";
  const baseName = (lastDotIndex >= 0 ? normalizedName.slice(0, lastDotIndex) : normalizedName)
    .toLowerCase()
    .replace(INVALID_FILE_CHARS_PATTERN, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "image";

  return stamp ? `${stamp}-${baseName}${extension}` : `${baseName}${extension}`;
}
