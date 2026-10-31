import { describe, expect, it } from "vitest";
import type { CategoryRef } from "../src/lib/api-types";
import { categoryLinks } from "../src/lib/nav";

const cat = (name: string, slug: string): CategoryRef => ({ name, slug });

describe("categoryLinks", () => {
  it("maps categories to links in order", () => {
    expect(categoryLinks([cat("Anime", "anime"), cat("Movies", "movies")])).toEqual([
      { label: "Anime", href: "/category/anime" },
      { label: "Movies", href: "/category/movies" },
    ]);
  });

  it("drops unsafe slugs, blank names and duplicates", () => {
    const result = categoryLinks([
      cat("Bad", "../admin"),
      cat("Worse", "//evil.example"),
      cat("Script", "javascript:alert(1)"),
      cat("Upper", "Anime"),
      cat("  ", "blank"),
      cat("Anime", "anime"),
      cat("Anime again", "anime"),
    ]);

    expect(result).toEqual([{ label: "Anime", href: "/category/anime" }]);
  });

  it("caps the number of links", () => {
    const many = Array.from({ length: 12 }, (_, i) => cat(`C${i}`, `c${i}`));

    expect(categoryLinks(many)).toHaveLength(8);
    expect(categoryLinks(many, 3)).toHaveLength(3);
  });

  it("returns nothing when there are no categories", () => {
    expect(categoryLinks(undefined)).toEqual([]);
    expect(categoryLinks([])).toEqual([]);
  });
});