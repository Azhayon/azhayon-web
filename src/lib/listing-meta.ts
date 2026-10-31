import type { Metadata } from "next";
import { pagePath } from "./paging";
import { ogImages, twitterImages } from "./social";

type Options = { title: string; description: string; basePath: string; page: number; noindex?: boolean };

/**
 * Metadata for one page of a list. Every page is its own canonical; page 1 uses the plain base path.
 * `robots` is set only for noindex, so the site-wide setting is never overridden.
 */
export function listingMetadata({ title, description, basePath, page, noindex = false }: Options): Metadata {
  const pageTitle = page > 1 ? `${title}, page ${page}` : title;
  const canonical = pagePath(basePath, page);

  return {
    title: pageTitle,
    description,
    alternates: { canonical },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: "website", title: pageTitle, description, url: canonical, images: ogImages() },
    twitter: { card: "summary_large_image", title: pageTitle, description, images: twitterImages() },
  };
}