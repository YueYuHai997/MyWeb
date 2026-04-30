import { sections } from "../../data/site-data.js";
import GradientText from "../effects/GradientText.jsx";
import RotatingText from "../effects/RotatingText.jsx";

const ROTATING_TEXTS = ["thinking", "Learning", "Creating"];

export default function Sidebar({ activeRoute }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="sidebar-rotating-text">
          <span className="sidebar-rotating-text-label">K e e p</span>
          <RotatingText
            texts={ROTATING_TEXTS}
            mainClassName="sidebar-rotating-text-chip"
            staggerFrom="last"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.03}
            splitLevelClassName="sidebar-rotating-text-split"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={3200}
          />
        </div>
        <h1 className="s-name">
          <GradientText
            colors={["#0500ff","#0f63a7", "#37bbc4"]}
            animationSpeed={3.2}
            showBorder={false}
            direction="horizontal"
            pauseOnHover={false}
            className="s-name-gradient"
          >
            YueYuHai
          </GradientText>
        </h1>
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
      </div>
    </aside>
  );
}
