import RevealItem from "./RevealItem.jsx";

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

export default function PostListItem({ section, item, index }) {
  const metaText = buildMetaText(item);

  return (
    <RevealItem index={index} className="post-item">
      <a className="entry-link" href={`#/${section}/${item.slug}`}>
        <h2 className="post-title">{item.title}</h2>
        {metaText ? <p className="post-meta">{metaText}</p> : null}
        <p className="post-body">{item.summary}</p>
        <TagList tags={item.tags} />
      </a>
    </RevealItem>
  );
}
