export type LinkTarget = { kind: "internal" | "external" | "mailto"; href: string };

/** One leading slash, printable ASCII, no backslash. */
const INTERNAL = /^\/(?!\/)[\x21-\x5B\x5D-\x7E]*$/;
const MAILTO = /^mailto:[^\s<>"'\\]{1,254}$/i;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const X_HOSTS = new Set(["x.com", "www.x.com", "twitter.com", "www.twitter.com", "mobile.twitter.com"]);

function parseWebUrl(value: string): URL | null {
  if (!/^https?:\/\//i.test(value)) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.hostname && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

/** What a link in a post may become. Anything else is shown as plain text, never as a link. */
export function classifyHref(href: string): LinkTarget | null {
  if (INTERNAL.test(href)) {
    return { kind: "internal", href };
  }

  if (MAILTO.test(href)) {
    return { kind: "mailto", href };
  }

  const url = parseWebUrl(href);

  return url ? { kind: "external", href: url.href } : null;
}

/** For links that leave the site. */
export const EXTERNAL_REL = "noopener noreferrer";

export function isYouTubeId(value: string): boolean {
  return YOUTUBE_ID.test(value);
}

/** An X post card may only link to X itself, over https. */
export function safeXPostUrl(value: string): string | null {
  const url = parseWebUrl(value);

  return url && url.protocol === "https:" && X_HOSTS.has(url.hostname) ? url.href : null;
}