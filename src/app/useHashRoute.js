import { useEffect, useState } from "react";

import { getDefaultHash, getRouteState } from "../data/site-data.js";

export function normalizeHashRoute(rawHash) {
  const route = getRouteState(rawHash);
  let hash = getDefaultHash();

  if (route.type === "editor") {
    hash = "#/editor";
  } else if (route.type === "detail") {
    hash = `#/${route.section}/${route.slug}`;
  } else {
    hash = `#/${route.section}`;
  }

  return {
    ...route,
    hash
  };
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => normalizeHashRoute(window.location.hash));

  useEffect(() => {
    const applyRoute = () => {
      const nextRoute = normalizeHashRoute(window.location.hash);

      if (window.location.hash !== nextRoute.hash) {
        window.history.replaceState(null, "", nextRoute.hash);
      }

      setRoute(nextRoute);
    };

    applyRoute();
    window.addEventListener("hashchange", applyRoute);

    return () => {
      window.removeEventListener("hashchange", applyRoute);
    };
  }, []);

  return route;
}
