/** Slugs are lowercase letters, digits and hyphens (see docs/API.md). */
export const isSlug = (value: string): boolean => /^[a-z0-9-]+$/.test(value);