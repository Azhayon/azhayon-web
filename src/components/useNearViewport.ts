"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

/** True once the element is within `margin` of the screen. It never goes back to false. */
export function useNearViewport(ref: RefObject<Element | null>, margin = "400px"): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || near) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setNear(true), 0);

      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [ref, near, margin]);

  return near;
}