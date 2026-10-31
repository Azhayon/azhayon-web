import { describe, expect, it } from "vitest";
import { browseParams, pageFrom, parseBrowse, queryHref } from "../src/lib/browse";

const categories = ["anime", "movies"];

describe("pageFrom", () => {
  it("treats a missing page as 1 and rejects an invalid one", () => {
    expect(pageFrom({})).toBe(1);
    expect(pageFrom({ page: "3" })).toBe(3);
    expect(pageFrom({ page: "0" })).toBeNull();
    expect(pageFrom({ page: "abc" })).toBeNull();
    expect(pageFrom({ page: ["1", "2"] })).toBeNull();
  });
});

describe("parseBrowse", () => {
  it("defaults to newest, page 1 and no filters", () => {
    expect(parseBrowse({}, categories)).toEqual({ sort: "newest", page: 1 });
  });

  it("accepts valid filters", () => {
    expect(parseBrowse({ category: "anime", type: "review", sort: "rating", page: "2" }, categories)).toEqual({
      category: "anime",
      type: "review",
      sort: "rating",
      page: 2,
    });
  });

  it("ignores unknown values and repeated parameters", () => {
    const query = parseBrowse({ category: "nope", type: "x", sort: ["popular", "oldest"] }, categories);

    expect(query).toEqual({ sort: "newest", page: 1 });
  });

  it("returns null for a bad page", () => {
    expect(parseBrowse({ page: "-1" }, categories)).toBeNull();
  });
});

describe("browseParams and queryHref", () => {
  it("leaves the default sort out of the address", () => {
    expect(browseParams({ sort: "newest", page: 1 })).toEqual({ category: undefined, type: undefined, sort: undefined });
    expect(browseParams({ sort: "popular", page: 1 }).sort).toBe("popular");
  });

  it("builds sorted, clean addresses with the page last", () => {
    expect(queryHref("/browse", { sort: "popular", category: "anime", type: undefined }, 3)).toBe(
      "/browse?category=anime&sort=popular&page=3",
    );
    expect(queryHref("/browse", {}, 1)).toBe("/browse");
    expect(queryHref("/search", { q: "solo leveling" }, 2)).toBe("/search?q=solo+leveling&page=2");
  });
});