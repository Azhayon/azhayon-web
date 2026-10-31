import { describe, expect, it } from "vitest";
import { buildSuggestUrl, cleanQuery, isSearchable, safeSuggestions } from "../src/lib/suggest";

const entry = (over: Record<string, unknown> = {}) => ({
  type: "post",
  label: "Solo Leveling",
  path: "/blog/solo-leveling",
  tag_type: null,
  ...over,
});

describe("cleanQuery and isSearchable", () => {
  it("trims, collapses spaces and caps the length", () => {
    expect(cleanQuery("  solo    leveling ")).toBe("solo leveling");
    expect(cleanQuery("a".repeat(200))).toHaveLength(80);
  });

  it("needs 2 characters with at least one letter or number", () => {
    expect(isSearchable("a")).toBe(false);
    expect(isSearchable("--")).toBe(false);
    expect(isSearchable("ab")).toBe(true);
    expect(isSearchable("進撃")).toBe(true);
  });
});

describe("safeSuggestions", () => {
  it("keeps well-formed suggestions, including search addresses", () => {
    const result = safeSuggestions({
      data: [entry(), entry({ type: "subject", label: "Isekai", path: "/search?q=isekai%20anime" })],
    });

    expect(result.map((s) => s.path)).toEqual(["/blog/solo-leveling", "/search?q=isekai%20anime"]);
  });

  it("drops off-site, malformed and unknown entries", () => {
    const result = safeSuggestions({
      data: [
        entry({ path: "https://evil.example/x" }),
        entry({ path: "//evil.example" }),
        entry({ path: "javascript:alert(1)" }),
        entry({ path: "/a\\b" }),
        entry({ path: "/blog/../admin" }),
        entry({ type: "nope" }),
        entry({ label: "   " }),
        null,
        "text",
      ],
    });

    expect(result).toEqual([]);
  });

  it("caps the list and survives a bad payload", () => {
    const many = Array.from({ length: 20 }, (_, i) => entry({ path: `/blog/p${i}` }));

    expect(safeSuggestions({ data: many })).toHaveLength(8);
    expect(safeSuggestions(null)).toEqual([]);
    expect(safeSuggestions({ data: "x" })).toEqual([]);
  });
});

describe("buildSuggestUrl", () => {
  it("builds the suggest address", () => {
    expect(buildSuggestUrl("http://127.0.0.1:8000/api/v1", "solo leveling")).toBe(
      "http://127.0.0.1:8000/api/v1/search/suggest?q=solo+leveling",
    );
  });
});