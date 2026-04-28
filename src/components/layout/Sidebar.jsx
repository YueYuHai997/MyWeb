import { sections } from "../../data/site-data.js";

export default function Sidebar({ activeRoute }) {
  return (
    <aside className="sidebar">
      <h1 className="s-name">YueYuHai</h1>
      <p className="s-sub">自由开发者 · 在探索中成长</p>
      <p className="s-bio">Stay Hungry, Stay Foolish</p>

      <ul className="s-nav">
        <li>
          <a href="#/notes" data-route="notes" aria-current={activeRoute === "notes" ? "page" : undefined}>
            <span className="nav-emoji" aria-hidden="true">
              {sections.notes.icon}
            </span>
            <span>{sections.notes.label}</span>
          </a>
        </li>
        <li>
          <a href="#/projects" data-route="projects" aria-current={activeRoute === "projects" ? "page" : undefined}>
            <span className="nav-emoji" aria-hidden="true">
              {sections.projects.icon}
            </span>
            <span>{sections.projects.label}</span>
          </a>
        </li>
        <li>
          <a href="#/reading" data-route="reading" aria-current={activeRoute === "reading" ? "page" : undefined}>
            <span className="nav-emoji" aria-hidden="true">
              {sections.reading.icon}
            </span>
            <span>{sections.reading.label}</span>
          </a>
        </li>
        <li>
          <a href="#/now" data-route="now" aria-current={activeRoute === "now" ? "page" : undefined}>
            <span className="nav-emoji" aria-hidden="true">
              {sections.now.icon}
            </span>
            <span>{sections.now.label}</span>
          </a>
        </li>
      </ul>

      <div className="s-links">
        <a className="pill" href="https://github.com" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a className="pill" href="mailto:13022233853@163.com">
          邮箱
        </a>
      </div>
    </aside>
  );
}
