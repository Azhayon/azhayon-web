import { describe, expect, it } from "vitest";
import { buildPostMetadata, categoryHref, tagHref } from "../src/lib/post-meta";

const post = (seo: Partial<Parameters<typeof buildPostMetadata>[0]["seo"]> = {}, excerpt: string | null = "An excerpt.") => ({
  path: "/blog/solo-leveling",
  title: "Solo Leveling",
  excerpt,
  published_at: "2026-10-18T06:44:00Z",
  updated_at: "2026-10-20T08:00:00Z",
  author: { name: "Ayon" },
  seo: {
    title: "Solo Leveling review",
    description: "A review.",
    canonical_url: "https://example.com/blog/solo-leveling",
    noindex: false,
    image: null,
    ...seo,
  },
});

describe("buildPostMetadata", () => {
  it("uses the post path as the canonical and the SEO title and description", () => {
    const meta = buildPostMetadata(post());

    expect(meta.alternates?.canonical).toBe("/blog/solo-leveling");
    expect(meta.title).toBe("Solo Leveling review");
    expect(meta.description).toBe("A review.");
  });

  it("leaves robots unset for an indexable post, so the site-wide setting applies", () => {
    expect("robots" in buildPostMetadata(post())).toBe(false);
  });

  it("sets noindex only when the API says so", () => {
    expect(buildPostMetadata(post({ noindex: true })).robots).toEqual({ index: false, follow: true });
  });

  it("falls back to the excerpt, then to nothing", () => {
    expect(buildPostMetadata(post({ description: null })).description).toBe("An excerpt.");
    expect(buildPostMetadata(post({ description: null }, null)).description).toBeUndefined();
  });

  it("adds a social image only for http or https addresses", () => {
    const withImage = buildPostMetadata(post({ image: "https://example.com/a.webp" }));
    const withBad = buildPostMetadata(post({ image: "javascript:alert(1)" }));

    expect(withImage.openGraph && "images" in withImage.openGraph).toBe(true);
    expect(withBad.openGraph && "images" in withBad.openGraph).toBe(false);
  });
});

describe("categoryHref and tagHref", () => {
  it("build paths for valid slugs and reject the rest", () => {
    expect(categoryHref("anime")).toBe("/category/anime");
    expect(tagHref("studio-mappa")).toBe("/tag/studio-mappa");
    expect(categoryHref("../admin")).toBeNull();
    expect(tagHref("A B")).toBeNull();
  });
});