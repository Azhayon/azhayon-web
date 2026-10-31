import { describe, expect, it } from "vitest";
import { articleJsonLd, breadcrumbJsonLd, serializeJsonLd } from "../src/lib/jsonld";

const site = { url: "https://azhayonmedia.com", name: "Azhayon Media" };

const post = (over: { image?: string | null; slug?: string } = {}) => ({
  path: "/blog/solo-leveling",
  title: "Solo Leveling review",
  excerpt: "An excerpt.",
  published_at: "2026-10-18T06:44:00Z",
  updated_at: "2026-10-20T08:00:00Z",
  author: { name: "Ayon" },
  category: { name: "Anime", slug: over.slug ?? "anime" },
  seo: {
    title: "Solo Leveling review",
    description: "A review.",
    canonical_url: "https://azhayonmedia.com/blog/solo-leveling",
    noindex: false,
    image: over.image === undefined ? "https://api.azhayonmedia.com/uploads/a.webp" : over.image,
  },
});

describe("articleJsonLd", () => {
  it("builds an Article with absolute address, dates, author and publisher", () => {
    const json = articleJsonLd(post(), site);

    expect(json["@type"]).toBe("Article");
    expect(json.mainEntityOfPage["@id"]).toBe("https://azhayonmedia.com/blog/solo-leveling");
    expect(json.datePublished).toBe("2026-10-18T06:44:00Z");
    expect(json.dateModified).toBe("2026-10-20T08:00:00Z");
    expect(json.author.name).toBe("Ayon");
    expect(json.publisher.name).toBe("Azhayon Media");
    expect(json.image).toEqual(["https://api.azhayonmedia.com/uploads/a.webp"]);
  });

  it("leaves out the image when there is none or it is not a web address", () => {
    expect("image" in articleJsonLd(post({ image: null }), site)).toBe(false);
    expect("image" in articleJsonLd(post({ image: "javascript:alert(1)" }), site)).toBe(false);
  });
});

describe("breadcrumbJsonLd", () => {
  it("lists Home, the category and the post in order", () => {
    const items = breadcrumbJsonLd(post(), site).itemListElement;

    expect(items.map((item) => item.item)).toEqual([
      "https://azhayonmedia.com/",
      "https://azhayonmedia.com/category/anime",
      "https://azhayonmedia.com/blog/solo-leveling",
    ]);
    expect(items.map((item) => item.position)).toEqual([1, 2, 3]);
  });

  it("skips a category whose slug is not valid", () => {
    expect(breadcrumbJsonLd(post({ slug: "../x" }), site).itemListElement).toHaveLength(2);
  });
});

describe("serializeJsonLd", () => {
  it("escapes angle brackets so text cannot close the script tag", () => {
    const text = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

    expect(text).not.toContain("<");
    expect(JSON.parse(text).name).toBe("</script><script>alert(1)</script>");
  });
});