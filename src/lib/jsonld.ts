import type { PostDetail } from "@/lib/api-types";

type Source = Pick<PostDetail, "path" | "title" | "excerpt" | "published_at" | "updated_at" | "author" | "seo" | "category">;
type Site = { url: string; name: string };

const SLUG = /^[a-z0-9-]+$/;

const absolute = (siteUrl: string, path: string) => `${siteUrl.replace(/\/+$/, "")}${path}`;

export function articleJsonLd(post: Source, site: Site) {
  const description = post.seo.description?.trim() || post.excerpt?.trim() || undefined;
  const image = post.seo.image && /^https?:\/\/\S+$/i.test(post.seo.image) ? post.seo.image : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title.slice(0, 110),
    ...(description ? { description } : {}),
    ...(image ? { image: [image] } : {}),
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": absolute(site.url, post.path) },
  };
}

export function breadcrumbJsonLd(post: Source, site: Site) {
  const trail: { name: string; url: string }[] = [{ name: "Home", url: absolute(site.url, "/") }];

  if (SLUG.test(post.category.slug)) {
    trail.push({ name: post.category.name, url: absolute(site.url, `/category/${post.category.slug}`) });
  }

  trail.push({ name: post.title, url: absolute(site.url, post.path) });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** JSON for a script tag. `<` is escaped so no text can close the tag early. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}