import type { MetadataRoute } from "next";
import { getSitemapPosts, getSitemapSummary, getSitemapTaxonomy } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import { serverEnv } from "@/lib/env";
import { SITEMAP_FIXED_PATHS, toSitemap } from "@/lib/seo";

/** 25 pages of 2,000 posts is the 50,000-address limit of one sitemap file. */
const MAX_POST_PAGES = 25;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl } = serverEnv();
  const [summary, taxonomy] = await Promise.all([getSitemapSummary(), getSitemapTaxonomy()]);

  const posts: { path: string; lastmod: string | null; image: string | null }[] = [];
  const pages = Math.min(summary.data.posts.pages, MAX_POST_PAGES);

  for (let page = 1; page <= pages; page += 1) {
    try {
      posts.push(...(await getSitemapPosts(page)).data);
    } catch (error) {
      // Posts were removed between the two calls: a page past the last is a 404, so stop here.
      if (error instanceof ApiError && error.status === 404) {
        break;
      }

      throw error;
    }
  }

  return toSitemap(siteUrl, [
    ...SITEMAP_FIXED_PATHS.map((path) => ({ path })),
    ...taxonomy.data.categories,
    ...taxonomy.data.tags,
    ...taxonomy.data.series,
    ...posts,
  ]);
}