import ContextPanel from "../layout/ContextPanel.jsx";
import PostList from "../content/PostList.jsx";
import ProjectsCircularGallery from "../content/ProjectsCircularGallery.jsx";
import {
  getProjectGalleryItems,
  getSectionDescription,
  getSectionNavigationItems,
  sections
} from "../../data/site-data.js";

function EmptyState({ title }) {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <p>当前还没有内容，后续直接往对应的 Markdown 目录添加文件即可。</p>
    </section>
  );
}

export default function ListPage({ section, contentBySection }) {
  const sectionMeta = sections[section];
  const items = contentBySection[section] || [];
  const navItems = getSectionNavigationItems(contentBySection, section);
  const galleryItems = section === "projects" ? getProjectGalleryItems(items) : [];

  return (
    <div className="content-shell">
      <div className="content-main">
        <section className="route-panel">
          <header className="section-head">
            <h1>{`${sectionMeta.icon} ${sectionMeta.title}`}</h1>
            <span className="section-desc">{getSectionDescription(section, contentBySection)}</span>
          </header>
          {items.length ? (
            section === "projects" ? (
              <ProjectsCircularGallery items={galleryItems} />
            ) : (
              <PostList section={section} items={items} />
            )
          ) : (
            <EmptyState title={sectionMeta.title} />
          )}
        </section>
      </div>

      <ContextPanel eyebrow={sectionMeta.label} title="本栏文章">
        {navItems.length ? (
          navItems.map((item, index) => (
            <a key={item.slug} className="context-link" href={`#/${section}/${item.slug}`}>
              <span className="context-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="context-label">{item.title}</span>
            </a>
          ))
        ) : (
          <p className="context-empty">当前栏目还没有文章。</p>
        )}
      </ContextPanel>
    </div>
  );
}
