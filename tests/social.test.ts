import { describe, expect, it } from "vitest";
import { organizationJsonLd, websiteJsonLd } from "../src/lib/jsonld";
import { DEFAULT_SOCIAL_IMAGE, ogImages, twitterImages } from "../src/lib/social";

describe("social images", () => {
  it("uses the page's own image, or the default", () => {
    expect(ogImages("https://example.com/a.webp")).toEqual([{ url: "https://example.com/a.webp" }]);
    expect(ogImages()).toEqual([DEFAULT_SOCIAL_IMAGE]);
    expect(twitterImages("https://example.com/a.webp")).toEqual(["https://example.com/a.webp"]);
    expect(twitterImages(null)).toEqual(["/og/default"]);
  });

  it("describes the default image at the size social sites expect", () => {
    expect(DEFAULT_SOCIAL_IMAGE.width).toBe(1200);
    expect(DEFAULT_SOCIAL_IMAGE.height).toBe(630);
  });
});

describe("site-wide JSON-LD", () => {
  const site = { url: "https://azhayonmedia.com/", name: "Azhayon Media" };

  it("describes the website without a search action", () => {
    const json = websiteJsonLd(site);

    expect(json["@type"]).toBe("WebSite");
    expect(json.url).toBe("https://azhayonmedia.com/");
    expect("potentialAction" in json).toBe(false);
  });

  it("describes the organization", () => {
    expect(organizationJsonLd(site)).toMatchObject({ "@type": "Organization", name: "Azhayon Media", url: "https://azhayonmedia.com/" });
  });
});