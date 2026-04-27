import CircularGallery from "../effects/CircularGallery.jsx";

export default function ProjectsCircularGallery({ items }) {
  return (
    <div className="projects-gallery-shell">
      <div className="projects-gallery-stage">
        <CircularGallery
          items={items}
          bend={1}
          textColor="#ffffff"
          borderRadius={0.05}
          scrollSpeed={2}
          scrollEase={0.05}
        />
      </div>
    </div>
  );
}
