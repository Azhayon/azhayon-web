const DATE = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

/** A short date such as "Oct 18, 2026". Always UTC, so the cached page never differs by server time zone. */
export function formatDate(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? "" : DATE.format(date);
}

/** A post link must be one of our own post paths. Anything else is not rendered as a link. */
export function postHref(path: string): string | null {
  return /^\/blog\/[a-z0-9-]+$/.test(path) ? path : null;
}

export const POST_TYPE_LABEL = {
  news: "News",
  review: "Review",
  explainer: "Explainer",
  list: "List",
} as const;