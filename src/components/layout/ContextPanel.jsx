export default function ContextPanel({ eyebrow, title, children }) {
  return (
    <aside className="context-panel">
      <div className="context-panel-inner">
        <p className="context-eyebrow">{eyebrow}</p>
        <h2 className="context-title">{title}</h2>
        <div className="context-nav">{children}</div>
      </div>
    </aside>
  );
}
