import { describe, expect, it } from "vitest";
import { formatRatingSummary, parseMyRating, starFilled } from "@/lib/rating";

describe("formatRatingSummary", () => {
  it("says so when nobody has rated", () => {
    expect(formatRatingSummary(0, 0)).toBe("No ratings yet");
    expect(formatRatingSummary(NaN, 3)).toBe("No ratings yet");
  });

  it("shows one decimal and the right plural", () => {
    expect(formatRatingSummary(4.5, 12)).toBe("4.5 out of 5 (12 ratings)");
    expect(formatRatingSummary(4, 1)).toBe("4.0 out of 5 (1 rating)");
    expect(formatRatingSummary(3.333, 3)).toBe("3.3 out of 5 (3 ratings)");
  });
});

describe("starFilled", () => {
  it("fills up to the saved score", () => {
    expect([1, 2, 3, 4, 5].map((n) => starFilled(n, null, 3))).toEqual([true, true, true, false, false]);
    expect([1, 2, 3, 4, 5].map((n) => starFilled(n, null, null))).toEqual([false, false, false, false, false]);
  });

  it("lets the hovered star win over the saved score", () => {
    expect([1, 2, 3, 4, 5].map((n) => starFilled(n, 5, 2))).toEqual([true, true, true, true, true]);
    expect([1, 2, 3, 4, 5].map((n) => starFilled(n, 1, 4))).toEqual([true, false, false, false, false]);
  });
});

describe("parseMyRating", () => {
  it("reads a rating with or without a score", () => {
    expect(parseMyRating({ rating: { score: 4, average: 4.25, count: 12 } })).toEqual({ score: 4, average: 4.25, count: 12 });
    expect(parseMyRating({ rating: { score: null, average: 0, count: 0 } })).toEqual({ score: null, average: 0, count: 0 });
  });

  it("keeps only the fields we expect", () => {
    expect(JSON.stringify(parseMyRating({ rating: { score: 5, average: 5, count: 1, user_id: 9 } }))).not.toContain("user_id");
  });

  it("is null for signed out, malformed or out of range answers", () => {
    const bad = [
      null, "x", [], {}, { rating: null }, { rating: "4" },
      { rating: { score: 6, average: 4, count: 1 } },
      { rating: { score: 0, average: 4, count: 1 } },
      { rating: { score: 4.5, average: 4, count: 1 } },
      { rating: { score: 4, average: 5.5, count: 1 } },
      { rating: { score: 4, average: "4", count: 1 } },
      { rating: { score: 4, average: 4, count: -1 } },
    ];

    for (const json of bad) {
      expect(parseMyRating(json)).toBeNull();
    }
  });
});