"use client";

import { useEffect } from "react";
import { PUBLIC_API_URL } from "@/lib/public-env";
import { buildViewUrl, viewKey } from "@/lib/views";

/** Counts one view per tab session, a couple of seconds after the page loads, so quick bounces do not count. */
const DELAY_MS = 2000;

export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const url = buildViewUrl(PUBLIC_API_URL || "", slug);

    if (!url) {
      return;
    }

    const key = viewKey(slug);

    try {
      if (sessionStorage.getItem(key)) {
        return;
      }
    } catch {
      // Storage blocked: the server still counts a visitor only once a day.
    }

    const timer = window.setTimeout(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      try {
        sessionStorage.setItem(key, "1");
      } catch {
        // Ignore.
      }

      // A bodyless POST with no custom headers is a simple request: no preflight, no answer needed.
      if (!navigator.sendBeacon?.(url)) {
        fetch(url, { method: "POST", mode: "no-cors", keepalive: true }).catch(() => {});
      }
    }, DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [slug]);

  return null;
}