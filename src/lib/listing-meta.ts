import type { Metadata } from "next";
import { pagePath } from "./paging";

type Options = { title: string; description: string; basePath: string; page: number };

/** Metadata for one page of a list. Every page is its own canonical; page 1 uses the plain base path. */
export function listingMetadata({ title, description, basePath, page }: Options): Metadata {
  const pageTitle = page > 1 ? `${title}, page ${page}` : title;
  const canonical = pagePath(basePath, page);

  return {
    title: pageTitle,
    description,
    alternates: { canonical },
    openGraph: { type: "website", title: pageTitle, description, url: canonical },
  };
}