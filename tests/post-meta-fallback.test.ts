import { describe, expect, it } from "vitest";
import { buildPostMetadata } from "@/lib/post-meta";
import { SITE_DESCRIPTION } from "@/lib/site";

type Source = Parameters<typeof buildPostMetadata>[0];

const post = (seoDescription: string | null, excerpt: string | null) =>
  ({
    path: "/blog/x",
    title: "X",
    excerpt,
    published_at: "2026-10-18T06:44:00Z",
    updated_at: "2026-10-18T06:44:00Z",
    author: { name: "A" },
    seo: { title: "X", description: seoDescription, canonical_url: "http://localhost:3000/blog/x", noindex: false, image: null },
  }) as unknown as Source;

describe("post description", () => {
  it("prefers the SEO description", () => {
    expect(buildPostMetadata(post("seo text", "excerpt text")).description).toBe("seo text");
  });

  it("falls back to the excerpt", () => {
    expect(buildPostMetadata(post(null, "excerpt text")).description).toBe("excerpt text");
  });

  it("falls back to the site description when both are empty or blank", () => {
    expect(buildPostMetadata(post(null, null)).description).toBe(SITE_DESCRIPTION);
    expect(buildPostMetadata(post("  ", "")).openGraph?.description).toBe(SITE_DESCRIPTION);
  });
});