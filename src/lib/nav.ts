import type { CategoryRef } from "@/lib/api-types";

export type NavLink = { label: string; href: string };

/** Slugs are lowercase letters, digits and hyphens (see docs/API.md). */
const SLUG = /^[a-z0-9-]+$/;

/** Turns the API's categories into header links: safe paths only, no duplicates, capped. */
export function categoryLinks(categories: readonly CategoryRef[] | undefined, max = 8): NavLink[] {
  const seen = new Set<string>();
  const links: NavLink[] = [];

  for (const category of categories ?? []) {
    const label = category.name?.trim();
    const slug = category.slug;

    if (!label || typeof slug !== "string" || !SLUG.test(slug)) {
      continue;
    }

    const href = `/category/${slug}`;

    if (seen.has(href)) {
      continue;
    }

    seen.add(href);
    links.push({ label, href });

    if (links.length >= max) {
      break;
    }
  }

  return links;
}