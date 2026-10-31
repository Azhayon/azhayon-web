import type { RedirectEntry } from "@/lib/api-types";

export type Target = { to: string; status: 301 | 302 | 307 | 308 };
export type RedirectMap = ReadonlyMap<string, Target>;

const STATUSES = new Set([301, 302, 307, 308]);
const MAX_HOPS = 5;

/** One leading slash, no query string. */
const FROM_PATH = /^\/(?!\/)[A-Za-z0-9\-._~%/]*$/;
/** One leading slash, an optional simple query string. */
const TO_PATH = /^\/(?!\/)[A-Za-z0-9\-._~%/]*(\?[A-Za-z0-9\-._~%&=+]*)?$/;

/** The path without trailing slashes, so /blog/old/ and /blog/old are the same key. */
export function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

/** Our own path (with optional query) from a stored destination, or null if it is not ours. */
function internalTarget(to: string, siteUrl: string): string | null {
  if (TO_PATH.test(to)) {
    return to;
  }

  if (!/^https?:\/\//i.test(to)) {
    return null;
  }

  try {
    const url = new URL(to);
    const own = url.origin === new URL(siteUrl).origin && !url.username && !url.password;
    const path = `${url.pathname}${url.search}`;

    return own && TO_PATH.test(path) ? path : null;
  } catch {
    return null;
  }
}

/** The lookup table from the API's redirect list. Invalid, self-pointing and duplicate entries are dropped; the first wins. */
export function buildRedirectMap(entries: readonly RedirectEntry[], siteUrl: string): RedirectMap {
  const map = new Map<string, Target>();

  for (const entry of entries) {
    if (typeof entry?.from !== "string" || typeof entry.to !== "string" || !FROM_PATH.test(entry.from)) {
      continue;
    }

    const from = normalizePath(entry.from);
    const to = internalTarget(entry.to, siteUrl);

    if (!to || !STATUSES.has(entry.status) || normalizePath(to.split("?")[0]) === from || map.has(from)) {
      continue;
    }

    map.set(from, { to, status: entry.status as Target["status"] });
  }

  return map;
}

/** Where a request should go, or null. Chains are followed to the end; loops and long chains give null. */
export function resolveRedirect(map: RedirectMap, pathname: string): Target | null {
  const start = normalizePath(pathname);
  const first = map.get(start);

  if (!first) {
    return null;
  }

  const seen = new Set([start]);
  let to = first.to;

  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    const key = normalizePath(to.split("?")[0]);

    if (seen.has(key)) {
      return null;
    }

    const next = map.get(key);

    if (!next) {
      return { to, status: first.status };
    }

    seen.add(key);
    to = next.to;
  }

  return null;
}

/** Paths the proxy never looks at: framework files, API and auth routes, and anything that is a file. */
export function shouldSkipPath(pathname: string): boolean {
  return /^\/(_next|api|auth)(\/|$)/.test(pathname) || /\.[A-Za-z0-9]+$/.test(pathname);
}