import CircularGallery from "../effects/CircularGallery.jsx";
import { PROJECTS_GALLERY_SETTINGS } from "./projects-gallery-config.js";

export default function ProjectsCircularGallery({ items }) {
  return (
    <div className="projects-gallery-shell">
      <div className="projects-gallery-stage">
        <CircularGallery
          items={items}
          bend={PROJECTS_GALLERY_SETTINGS.bend}
          textColor={PROJECTS_GALLERY_SETTINGS.textColor}
          borderRadius={PROJECTS_GALLERY_SETTINGS.borderRadius}
          font={PROJECTS_GALLERY_SETTINGS.font}
          scrollSpeed={PROJECTS_GALLERY_SETTINGS.scrollSpeed}
          scrollEase={PROJECTS_GALLERY_SETTINGS.scrollEase}
        />
      </div>
    </div>
  );
}
