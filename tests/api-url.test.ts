import { describe, expect, it } from "vitest";
import { buildApiUrl } from "../src/lib/api/url";

const base = "http://127.0.0.1:8000/api/v1";

describe("buildApiUrl", () => {
  it("builds addresses with and without parameters", () => {
    expect(buildApiUrl(base, "/site")).toBe(`${base}/site`);
    expect(buildApiUrl(`${base}/`, "/site")).toBe(`${base}/site`);
  });

  it("sorts keys and drops empty values, so equal requests share one cache entry", () => {
    expect(buildApiUrl(base, "/posts", { sort: "newest", page: 2, category: undefined, tag: "", series: null })).toBe(
      `${base}/posts?page=2&sort=newest`,
    );
    expect(buildApiUrl(base, "/posts", { page: 2, sort: "newest" })).toBe(buildApiUrl(base, "/posts", { sort: "newest", page: 2 }));
  });

  it("keeps false and zero", () => {
    expect(buildApiUrl(base, "/x", { b: 0, a: false })).toBe(`${base}/x?a=false&b=0`);
  });

  it("encodes values", () => {
    expect(buildApiUrl(base, "/search", { q: "Attack on Titan & more" })).toBe(`${base}/search?q=Attack+on+Titan+%26+more`);
  });

  it("refuses unsafe paths", () => {
    for (const path of ["posts", "//evil.test/x", "/posts?x=1", "/posts#top", "/posts/../secret", "/a\\b"]) {
      expect(() => buildApiUrl(base, path), path).toThrow();
    }
  });
});