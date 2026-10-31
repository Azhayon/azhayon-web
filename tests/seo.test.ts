import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { absoluteUrl, buildRobots, ROBOTS_DISALLOW, SITEMAP_FIXED_PATHS, toSitemap } from "../src/lib/seo";

const site = "https://azhayonmedia.com";

describe("absoluteUrl", () => {
  it("builds addresses for our own paths", () => {
    expect(absoluteUrl(site, "/blog/solo-leveling")).toBe("https://azhayonmedia.com/blog/solo-leveling");
    expect(absoluteUrl("https://azhayonmedia.com/", "/")).toBe("https://azhayonmedia.com/");
  });

  it("rejects anything else", () => {
    for (const path of ["//evil.example", "https://evil.example/x", "/a/../b", "/a?x=1", "/a b", "", "blog/x"]) {
      expect(absoluteUrl(site, path), path).toBeNull();
    }
  });
});

describe("toSitemap", () => {
  it("maps path, date and image", () => {
    const entries = toSitemap(site, [
      { path: "/blog/a", lastmod: "2026-10-18T06:44:00Z", image: "https://api.azhayonmedia.com/uploads/a.webp" },
      { path: "/tag/x", lastmod: null },
    ]);

    expect(entries).toEqual([
      {
        url: "https://azhayonmedia.com/blog/a",
        lastModified: new Date("2026-10-18T06:44:00Z"),
        images: ["https://api.azhayonmedia.com/uploads/a.webp"],
      },
      { url: "https://azhayonmedia.com/tag/x" },
    ]);
  });

  it("skips unsafe and duplicate entries and ignores bad dates and images", () => {
    const entries = toSitemap(site, [
      { path: "//evil.example" },
      { path: "/ok" },
      { path: "/ok" },
      { path: "/bad path" },
      { path: "/x", lastmod: "not a date", image: "javascript:alert(1)" },
    ]);

    expect(entries.map((entry) => entry.url)).toEqual(["https://azhayonmedia.com/ok", "https://azhayonmedia.com/x"]);
    expect("lastModified" in entries[1]).toBe(false);
    expect("images" in entries[1]).toBe(false);
  });
});

describe("buildRobots", () => {
  it("closes the whole site before launch and lists no sitemap", () => {
    expect(buildRobots(site, false)).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });

  it("opens the site after launch, except thin and private areas, and lists the sitemap", () => {
    expect(buildRobots("https://azhayonmedia.com/", true)).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: [...ROBOTS_DISALLOW] },
      sitemap: "https://azhayonmedia.com/sitemap.xml",
    });
  });
});

describe("fixed sitemap pages", () => {
  it("all exist as pages", () => {
    for (const path of SITEMAP_FIXED_PATHS) {
      const file = path === "/" ? "../src/app/page.tsx" : `../src/app${path}/page.tsx`;

      expect(existsSync(fileURLToPath(new URL(file, import.meta.url))), path).toBe(true);
    }
  });
});