import { useEffect, useState } from "react";

import { getRouteState } from "../data/site-data.js";

export function normalizeHashRoute(rawHash) {
  const route = getRouteState(rawHash);
  const hash = route.type === "detail" ? `#/${route.section}/${route.slug}` : `#/${route.section}`;

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
