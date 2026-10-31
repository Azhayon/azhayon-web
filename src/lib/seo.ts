import type { MetadataRoute } from "next";

/** Pages that always exist and should be indexed. Search, browse, auth and preview are left out on purpose. */
export const SITEMAP_FIXED_PATHS = ["/", "/blog", "/about", "/contact", "/privacy", "/terms", "/cookies"] as const;

/** Paths crawlers are asked to stay out of once the site is open. */
export const ROBOTS_DISALLOW = ["/search", "/browse", "/auth/", "/api/", "/preview/"] as const;

/** One leading slash, no query string, no scheme. */
const SITE_PATH = /^\/(?!\/)[A-Za-z0-9\-._~%/]*$/;

const origin = (siteUrl: string) => siteUrl.replace(/\/+$/, "");

/** An absolute address for one of our own paths, or null if the path is not safe. */
export function absoluteUrl(siteUrl: string, path: string): string | null {
  return SITE_PATH.test(path) && !path.includes("..") ? `${origin(siteUrl)}${path}` : null;
}

type Item = { path: string; lastmod?: string | null; image?: string | null };

function validDate(value: string | null | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

const webImage = (value: string | null | undefined): string | undefined =>
  value && /^https?:\/\/\S+$/i.test(value) ? value : undefined;

/** Sitemap entries from API items: safe paths only, no duplicates, dates and images only when valid. */
export function toSitemap(siteUrl: string, items: readonly Item[]): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  for (const item of items) {
    const url = absoluteUrl(siteUrl, item.path);

    if (!url || seen.has(url)) {
      continue;
    }

    seen.add(url);

    const lastModified = validDate(item.lastmod);
    const image = webImage(item.image);

    entries.push({
      url,
      ...(lastModified ? { lastModified } : {}),
      ...(image ? { images: [image] } : {}),
    });
  }

  return entries;
}

/** robots.txt. Until launch everything is closed; afterwards only the thin and private areas are. */
export function buildRobots(siteUrl: string, allowIndexing: boolean): MetadataRoute.Robots {
  if (!allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: [...ROBOTS_DISALLOW] },
    sitemap: `${origin(siteUrl)}/sitemap.xml`,
  };
}