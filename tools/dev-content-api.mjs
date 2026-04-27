import { access, mkdir, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, extname, resolve } from "node:path";

import { VALID_SECTIONS } from "../src/data/content-model.js";
import {
  buildMarkdownFile,
  createAssetFileName,
  getTodayDate,
  parseTagsInput,
  slugifyTitle
} from "../src/data/editor-utils.js";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function pathExists(targetPath) {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function ensureValidSection(section) {
  const normalizedSection = normalizeText(section).toLowerCase();
  if (!VALID_SECTIONS.includes(normalizedSection)) {
    throw new Error("无效栏目");
  }

  return normalizedSection;
}

function createTimestampStamp() {
  return new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
}

async function resolveUniqueAssetPath(rootDir, section, originalName) {
  const baseDir = resolve(rootDir, "public", "content-assets", section);
  const stamp = createTimestampStamp();
  const extension = extname(originalName).toLowerCase();
  let fileName = createAssetFileName(originalName, stamp);
  let targetPath = resolve(baseDir, fileName);
  let index = 1;

  while (await pathExists(targetPath)) {
    fileName = `${stamp}-${index}${extension || ".png"}`;
    targetPath = resolve(baseDir, fileName);
    index += 1;
  }

  return {
    baseDir,
    fileName,
    targetPath
  };
}

async function handleSaveContent(rootDir, payload, res) {
  const section = ensureValidSection(payload.section);
  const title = normalizeText(payload.title);
  const slug = slugifyTitle(payload.slug || title);
  const date = normalizeText(payload.date) || getTodayDate();
  const summary = normalizeText(payload.summary);
  const body = String(payload.body ?? "").trim();
  const tags = Array.isArray(payload.tags) ? payload.tags : parseTagsInput(payload.tags);
  const draft = Boolean(payload.draft);

  if (!title) {
    sendJson(res, 400, { success: false, message: "标题不能为空" });
    return;
  }

  if (!body) {
    sendJson(res, 400, { success: false, message: "正文不能为空" });
    return;
  }

  const filePath = resolve(rootDir, "content", section, `${slug}.md`);

  if (await pathExists(filePath)) {
    sendJson(res, 409, { success: false, message: "slug 已存在，请修改后重试" });
    return;
  }

  const markdown = buildMarkdownFile({
    title,
    date,
    summary,
    tags,
    draft,
    body
  });

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, markdown, "utf8");

  sendJson(res, 200, {
    success: true,
    message: "保存成功",
    filePath,
    slug,
    section,
    hash: `#/${section}/${slug}`
  });
}

async function handleUploadImage(rootDir, payload, res) {
  const section = ensureValidSection(payload.section);
  const originalName = normalizeText(payload.fileName);
  const contentBase64 = normalizeText(payload.contentBase64);

  if (!originalName || !contentBase64) {
    sendJson(res, 400, { success: false, message: "图片数据不完整" });
    return;
  }

  const imageBuffer = Buffer.from(contentBase64, "base64");
  const { baseDir, fileName, targetPath } = await resolveUniqueAssetPath(rootDir, section, originalName);

  await mkdir(baseDir, { recursive: true });
  await writeFile(targetPath, imageBuffer);

  sendJson(res, 200, {
    success: true,
    message: "图片上传成功",
    src: `/content-assets/${section}/${fileName}`
  });
}

export function createDevContentApiPlugin(rootDir) {
  return {
    name: "dev-content-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || req.method !== "POST") {
          next();
          return;
        }

        try {
          if (req.url === "/__local-api/content/save") {
            const payload = await readJsonBody(req);
            await handleSaveContent(rootDir, payload, res);
            return;
          }

          if (req.url === "/__local-api/content/upload-image") {
            const payload = await readJsonBody(req);
            await handleUploadImage(rootDir, payload, res);
            return;
          }

          next();
        } catch (error) {
          sendJson(res, 500, {
            success: false,
            message: error instanceof Error ? error.message : "保存失败"
          });
        }
      });
    }
  };
}
