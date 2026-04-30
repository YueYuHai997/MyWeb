export const CIRCULAR_GALLERY_LAYOUT = {
  mediaBaseHeight: 700,
  mediaBaseWidth: 520,
  titleFont: "bold 26px monospace",
  titleScaleRatio: 0.14,
  titleOffsetRatio: 0.35,
  titleGap: 0.05,
};

export function getMediaScale(screenHeight) {
  return screenHeight / 1800;
}

export function getFontPixelSize(font, fallback = 26) {
  const match = String(font ?? "").match(/(\d+(?:\.\d+)?)px/i);

  if (!match) {
    return fallback;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getTitleOffsetY(planeScaleY, textHeight) {
  return Number(
    (-planeScaleY * 0.5 - textHeight * CIRCULAR_GALLERY_LAYOUT.titleOffsetRatio - CIRCULAR_GALLERY_LAYOUT.titleGap).toFixed(2)
  );
}
