import { createContentBySection } from "./site-data.mjs";

const markdownModules = import.meta.glob("../../content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true
});

export const contentBySection = createContentBySection(markdownModules);
