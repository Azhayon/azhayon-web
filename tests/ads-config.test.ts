import { describe, expect, it } from "vitest";
import type { AdsOn } from "../src/lib/api-types";
import { inArticleAds } from "../src/lib/ads";

const base: AdsOn = {
  enabled: true,
  client: "ca-pub-1234567890123456",
  placements: {
    sidebar: { enabled: false, slot: null },
    in_article: { enabled: true, slot: "1234567890" },
    anchor: { enabled: false, slot: null },
  },
  rules: { in_article_every: 4, in_article_max: 3 },
};

describe("inArticleAds", () => {
  it("is off when ads are off or missing", () => {
    expect(inArticleAds({ enabled: false })).toBeNull();
    expect(inArticleAds(undefined)).toBeNull();
  });

  it("is off when the placement is off or the rules make no sense", () => {
    expect(inArticleAds({ ...base, placements: { ...base.placements, in_article: { enabled: false, slot: null } } })).toBeNull();
    expect(inArticleAds({ ...base, rules: { in_article_every: 0, in_article_max: 3 } })).toBeNull();
    expect(inArticleAds({ ...base, rules: { in_article_every: 4, in_article_max: 0 } })).toBeNull();
  });

  it("returns the slot and the rules, and drops a slot that is not a number", () => {
    expect(inArticleAds(base)).toEqual({ slot: "1234567890", rules: { in_article_every: 4, in_article_max: 3 } });
    expect(
      inArticleAds({ ...base, placements: { ...base.placements, in_article: { enabled: true, slot: "abc" } } })?.slot,
    ).toBeNull();
  });
});