import { describe, expect, it } from "vitest";
import { reviewJsonLd } from "../src/lib/jsonld";

const site = { url: "https://azhayonmedia.com", name: "Azhayon Media" };

const post = (over: Partial<Parameters<typeof reviewJsonLd>[0]> = {}) => ({
  type: "review" as const,
  subject: "Solo Leveling",
  review_score: 8.5,
  author: { name: "Ayon" },
  published_at: "2026-10-18T06:44:00Z",
  category: { name: "Anime", slug: "anime" },
  ...over,
});

describe("reviewJsonLd", () => {
  it("builds a Review of the subject with a 0 to 10 rating", () => {
    const json = reviewJsonLd(post(), site);

    expect(json?.["@type"]).toBe("Review");
    expect(json?.itemReviewed).toEqual({ "@type": "CreativeWorkSeries", name: "Solo Leveling" });
    expect(json?.reviewRating).toEqual({ "@type": "Rating", ratingValue: 8.5, bestRating: 10, worstRating: 0 });
    expect(json?.author.name).toBe("Ayon");
  });

  it("uses Movie for the movies category", () => {
    expect(reviewJsonLd(post({ category: { name: "Movies", slug: "movies" } }), site)?.itemReviewed["@type"]).toBe("Movie");
  });

  it("returns nothing for posts that are not scored reviews", () => {
    expect(reviewJsonLd(post({ type: "news" }), site)).toBeNull();
    expect(reviewJsonLd(post({ review_score: null }), site)).toBeNull();
    expect(reviewJsonLd(post({ subject: null }), site)).toBeNull();
    expect(reviewJsonLd(post({ subject: "   " }), site)).toBeNull();
  });

  it("returns nothing for an unknown category or a score outside the scale", () => {
    expect(reviewJsonLd(post({ category: { name: "Other", slug: "other" } }), site)).toBeNull();
    expect(reviewJsonLd(post({ review_score: 11 }), site)).toBeNull();
    expect(reviewJsonLd(post({ review_score: -1 }), site)).toBeNull();
    expect(reviewJsonLd(post({ review_score: Number.NaN }), site)).toBeNull();
  });
});