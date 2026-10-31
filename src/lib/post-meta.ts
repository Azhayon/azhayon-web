import type { Metadata } from "next";
import type { PostDetail } from "@/lib/api-types";
import { SITE_NAME } from "@/lib/site";
import { ogImages, twitterImages } from "@/lib/social";

type MetaSource = Pick<PostDetail, "path" | "title" | "excerpt" | "published_at" | "updated_at" | "author" | "seo">;

const SLUG = /^[a-z0-9-]+$/;

export const categoryHref = (slug: string): string | null => (SLUG.test(slug) ? `/category/${slug}` : null);
export const tagHref = (slug: string): string | null => (SLUG.test(slug) ? `/tag/${slug}` : null);

function webImage(value: string | null): string | null {
  return value && /^https?:\/\/[^\s]+$/i.test(value) ? value : null;
}

/** Page metadata for a post. `robots` is set only for noindex, so the site-wide setting is never overridden. */
export function buildPostMetadata(post: MetaSource): Metadata {
  const description = post.seo.description?.trim() || post.excerpt?.trim() || undefined;
  const image = webImage(post.seo.image);

  return {
    title: post.seo.title,
    description,
    alternates: { canonical: post.path },
    ...(post.seo.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: post.seo.title,
      description,
      url: post.path,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author.name],
      images: ogImages(image),
    },
    twitter: { card: "summary_large_image", title: post.seo.title, description, images: twitterImages(image) },
  };
}