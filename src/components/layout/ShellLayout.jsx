import Sidebar from "./Sidebar.jsx";
import ContentFooter from "./ContentFooter.jsx";

export default function ShellLayout({ children, routeKey, isDev }) {
  return (
    <div className="shell">
      <Sidebar activeRoute={routeKey} isDev={isDev} />
      <main className="content">
        {children}
        <ContentFooter />
      </main>
    </div>
  );
}
