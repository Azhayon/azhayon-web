import { SITE_NAME } from "@/lib/site";

/** The preview picture for pages that have no image of their own. Resolved against metadataBase. */
export const DEFAULT_SOCIAL_IMAGE = { url: "/og/default", width: 1200, height: 630, alt: SITE_NAME } as const;

/** Open Graph images: the page's own picture when it has one, the default otherwise. */
export function ogImages(custom?: string | null) {
  return custom ? [{ url: custom }] : [DEFAULT_SOCIAL_IMAGE];
}

export function twitterImages(custom?: string | null) {
  return [custom ?? DEFAULT_SOCIAL_IMAGE.url];
}