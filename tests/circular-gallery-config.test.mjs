import test from "node:test";
import assert from "node:assert/strict";

import { PROJECTS_GALLERY_SETTINGS } from "../src/components/content/projects-gallery-config.js";
import {
  CIRCULAR_GALLERY_LAYOUT,
  getFontPixelSize,
  getMediaScale,
  getTitleOffsetY
} from "../src/components/effects/circular-gallery-layout.js";

test("projects gallery uses the requested circular gallery props", () => {
  assert.deepEqual(PROJECTS_GALLERY_SETTINGS, {
    bend: 1,
    textColor: "#000000",
    borderRadius: 0.05,
    font: '600 22px "Inter", "Noto Sans SC", "Microsoft YaHei UI", sans-serif',
    scrollSpeed: 2,
    scrollEase: 0.05
  });
});

test("circular gallery layout uses a smaller media base size", () => {
  assert.equal(CIRCULAR_GALLERY_LAYOUT.mediaBaseHeight, 700);
  assert.equal(CIRCULAR_GALLERY_LAYOUT.mediaBaseWidth, 520);
  assert.equal(CIRCULAR_GALLERY_LAYOUT.titleFont, "bold 26px monospace");
  assert.equal(getMediaScale(1800), 1);
});

test("title offset keeps labels below the card", () => {
  assert.equal(getTitleOffsetY(10, 1), -5.37);
});

test("font size parser extracts px size from weighted font declarations", () => {
  assert.equal(getFontPixelSize("bold 26px monospace"), 26);
});
