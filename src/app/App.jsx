import { useEffect } from "react";

import ShellLayout from "../components/layout/ShellLayout.jsx";
import ListPage from "../components/pages/ListPage.jsx";
import DetailPage from "../components/pages/DetailPage.jsx";
import ClickSpark from "../components/effects/ClickSpark.jsx";
import { SITE_NAME, findItemBySlug, sections } from "../data/site-data.js";
import { contentBySection } from "../data/site-content.js";
import { useHashRoute } from "./useHashRoute.js";

export default function App() {
  const route = useHashRoute();
  const section = route.section ?? "notes";
  const detailItem = route.type === "detail" ? findItemBySlug(contentBySection, route.section, route.slug) : null;

  useEffect(() => {
    if (route.type === "detail" && !detailItem) {
      window.history.replaceState(null, "", `#/${route.section}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }, [detailItem, route]);

  let page = null;
  let pageTitle = SITE_NAME;

  if (route.type === "detail" && detailItem) {
    pageTitle = `${detailItem.detailTitle} - ${SITE_NAME}`;
    page = <DetailPage section={route.section} item={detailItem} />;
  } else {
    pageTitle = `${sections[section].label} - ${SITE_NAME}`;
    page = <ListPage section={section} contentBySection={contentBySection} />;
  }

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <ShellLayout routeKey={route.section ?? "notes"}>
      <ClickSpark sparkColor="#06B6D4" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
        {page}
      </ClickSpark>
    </ShellLayout>
  );
}
