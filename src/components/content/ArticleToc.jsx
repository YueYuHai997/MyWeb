export default function ArticleToc({ toc }) {
  if (!toc?.length) {
    return <p className="context-empty">这篇文章还没有二级标题目录。</p>;
  }

  return (
    <>
      {toc.map((heading) => (
        <button
          key={`${heading.id}-${heading.level}`}
          type="button"
          className={`context-link context-link-button context-level-${heading.level}`}
          onClick={() => {
            const target = document.getElementById(heading.id);
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        >
          <span className="context-label">{heading.text}</span>
        </button>
      ))}
    </>
  );
}
