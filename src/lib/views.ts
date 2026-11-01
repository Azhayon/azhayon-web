const SLUG = /^[a-z0-9-]+$/;

/** The address that counts a view, or null when there is no API address or the slug could not exist. */
export function buildViewUrl(apiUrl: string, slug: string): string | null {
  const base = apiUrl.trim().replace(/\/+$/, "");

  if (!base || !SLUG.test(slug)) {
    return null;
  }

  return `${base}/posts/${slug}/view`;
}

/** The sessionStorage key that remembers this tab already counted the post. */
export const viewKey = (slug: string): string => `azm_viewed:${slug}`;