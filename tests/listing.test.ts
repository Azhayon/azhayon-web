import { describe, expect, it } from "vitest";
import { listingMetadata } from "../src/lib/listing-meta";
import { pagePath, pageWindow, parsePage } from "../src/lib/paging";

describe("parsePage", () => {
  it("accepts plain page numbers up to the limit", () => {
    expect(parsePage("1")).toBe(1);
    expect(parsePage("42")).toBe(42);
    expect(parsePage("500")).toBe(500);
  });

  it("rejects everything else", () => {
    for (const raw of ["0", "01", "501", "-1", "1.5", "abc", "", " 2", "2 ", "1e2", "9999"]) {
      expect(parsePage(raw), raw).toBeNull();
    }
  });
});

describe("pagePath", () => {
  it("gives page 1 the plain base path and later pages /page/N", () => {
    expect(pagePath("/blog", 1)).toBe("/blog");
    expect(pagePath("/blog", 2)).toBe("/blog/page/2");
    expect(pagePath("/category/anime", 3)).toBe("/category/anime/page/3");
  });
});

describe("pageWindow", () => {
  it("shows nothing for a single page", () => {
    expect(pageWindow(1, 1)).toEqual([]);
    expect(pageWindow(1, 0)).toEqual([]);
  });

  it("shows neighbours and ends, with gaps only where pages are skipped", () => {
    expect(pageWindow(1, 5)).toEqual([1, 2, "gap", 5]);
    expect(pageWindow(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(4, 10)).toEqual([1, 2, 3, 4, 5, "gap", 10]);
    expect(pageWindow(10, 20)).toEqual([1, "gap", 9, 10, 11, "gap", 20]);
    expect(pageWindow(20, 20)).toEqual([1, "gap", 19, 20]);
  });
});

describe("listingMetadata", () => {
  it("uses the base path and the plain title for page 1", () => {
    const meta = listingMetadata({ title: "Latest posts", description: "d", basePath: "/blog", page: 1 });

    expect(meta.title).toBe("Latest posts");
    expect(meta.alternates?.canonical).toBe("/blog");
  });

  it("gives later pages their own title and canonical", () => {
    const meta = listingMetadata({ title: "Latest posts", description: "d", basePath: "/blog", page: 3 });

    expect(meta.title).toBe("Latest posts, page 3");
    expect(meta.alternates?.canonical).toBe("/blog/page/3");
  });
});