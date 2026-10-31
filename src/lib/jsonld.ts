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

type ReviewSource = Pick<PostDetail, "type" | "subject" | "review_score" | "author" | "published_at" | "category">;

/** What each category's reviews are about, in schema.org terms. Edit this to match your category slugs. */
export const REVIEW_ITEM_TYPE: Readonly<Record<string, string>> = {
  movies: "Movie",
  anime: "CreativeWorkSeries",
  manga: "CreativeWorkSeries",
  manhwa: "CreativeWorkSeries",
};

export const REVIEW_SCALE = { worst: 0, best: 10 } as const;

/** Review markup, or null when the post is not a scored review of a known kind of thing. */
export function reviewJsonLd(post: ReviewSource, site: Site) {
  const itemType = REVIEW_ITEM_TYPE[post.category.slug];
  const name = post.subject?.trim();
  const score = post.review_score;

  if (post.type !== "review" || !itemType || !name || score === null || !Number.isFinite(score)) {
    return null;
  }

  if (score < REVIEW_SCALE.worst || score > REVIEW_SCALE.best) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@type": itemType, name },
    reviewRating: {
      "@type": "Rating",
      ratingValue: Math.round(score * 10) / 10,
      bestRating: REVIEW_SCALE.best,
      worstRating: REVIEW_SCALE.worst,
    },
    author: { "@type": "Person", name: post.author.name },
    datePublished: post.published_at,
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export function websiteJsonLd(site: Site) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: absolute(site.url, "/"),
    inLanguage: "en",
  };
}

export function organizationJsonLd(site: Site) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: absolute(site.url, "/"),
  };
}