import ContextPanel from "../layout/ContextPanel.jsx";
import ArticleToc from "../content/ArticleToc.jsx";
import { sections } from "../../data/site-data.js";

function TagList({ tags }) {
  if (!tags?.length) {
    return null;
  }

  return (
    <div className="post-tags detail-tags">
      {tags.map((tag) => (
        <span key={tag} className="tag">
          {tag}
        </span>
      ))}
    </div>
  );
}

function buildMetaText(item) {
  return [item.date, item.status, item.sub].filter(Boolean).join(" 路 ");
}

export default function DetailPage({ section, item }) {
  const sectionMeta = sections[section];
  const metaText = buildMetaText(item);

  return (
    <div className="content-shell">
      <div className="content-main">
        <article className="route-panel detail-article">
          <a className="detail-back" href={`#/${section}`}>
            返回{sectionMeta.label}
          </a>
          <header className="detail-header">
            <p className="detail-section-name">{`${sectionMeta.icon} ${sectionMeta.navLabel}`}</p>
            <h1>{item.detailTitle}</h1>
            {metaText ? <p className="detail-meta">{metaText}</p> : null}
            {item.lead ? <p className="detail-lead">{item.lead}</p> : null}
            <TagList tags={item.tags} />
          </header>
          <div className="detail-body markdown-body" dangerouslySetInnerHTML={{ __html: item.html }} />
        </article>
      </div>

      <ContextPanel eyebrow={item.title} title="文章目录">
        <ArticleToc toc={item.toc} />
      </ContextPanel>
    </div>
  );
}
