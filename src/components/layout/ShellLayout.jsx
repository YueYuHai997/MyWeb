import Sidebar from "./Sidebar.jsx";
import ContentFooter from "./ContentFooter.jsx";

export default function ShellLayout({ children, routeKey }) {
  return (
    <div className="shell">
      <Sidebar activeRoute={routeKey} />
      <main className="content">
        {children}
        <ContentFooter />
      </main>
    </div>
  );
}
