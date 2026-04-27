import { SITE_NAME } from "../../data/site-data.js";

export default function ContentFooter() {
  return (
    <footer className="content-footer">
      <span>{SITE_NAME}</span>
      <span>&copy; {new Date().getFullYear()}</span>
    </footer>
  );
}
