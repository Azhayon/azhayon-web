import { describe, expect, it } from "vitest";
import { listingMetadata } from "../src/lib/listing-meta";
import { isSlug } from "../src/lib/slug";

describe("isSlug", () => {
  it("accepts lowercase letters, digits and hyphens", () => {
    expect(isSlug("studio-mappa")).toBe(true);
    expect(isSlug("anime2")).toBe(true);
  });

  it("rejects everything else", () => {
    for (const value of ["", "Anime", "a b", "a/b", "..", "a_b", "é", "a%20b"]) {
      expect(isSlug(value), value).toBe(false);
    }
  });
});

describe("listingMetadata robots", () => {
  const base = { title: "Tag", description: "d", basePath: "/tag/x", page: 1 };

  it("sets noindex only when asked", () => {
    expect(listingMetadata({ ...base, noindex: true }).robots).toEqual({ index: false, follow: true });
    expect("robots" in listingMetadata(base)).toBe(false);
  });
});