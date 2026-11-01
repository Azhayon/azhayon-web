import { describe, expect, it } from "vitest";
import { lowercasePath } from "@/lib/redirects";

describe("lowercasePath", () => {
  it("lowercases paths with capitals", () => {
    expect(lowercasePath("/category/Anime")).toBe("/category/anime");
    expect(lowercasePath("/blog/Hunter-Hunter")).toBe("/blog/hunter-hunter");
    expect(lowercasePath("/TAG/MANGA")).toBe("/tag/manga");
  });

  it("leaves lowercase paths alone", () => {
    expect(lowercasePath("/category/anime")).toBeNull();
    expect(lowercasePath("/")).toBeNull();
    expect(lowercasePath("/blog/page/2")).toBeNull();
  });
});