/** The cache tags the API sends when content changes. Every cached fetch uses these. */
export const TAGS = {
  site: "site",
  home: "home",
  posts: "posts",
  taxonomy: "taxonomy",
  sitemap: "sitemap",
  redirects: "redirects",
  post: (slug: string) => `post:${slug}`,
} as const;

/** What the API's "all" tag expands to. Post pages carry "posts" as well, so it covers them. */
export const ALL_TAGS = [TAGS.site, TAGS.home, TAGS.posts, TAGS.taxonomy, TAGS.sitemap, TAGS.redirects] as const;