import { describe, expect, it } from "vitest";
import { formatDate, POST_TYPE_LABEL, postHref } from "../src/lib/format";

describe("formatDate", () => {
  it("formats an ISO date in UTC", () => {
    expect(formatDate("2026-10-18T06:44:00Z")).toBe("Oct 18, 2026");
    expect(formatDate("2026-12-31T23:59:00Z")).toBe("Dec 31, 2026");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatDate("not a date")).toBe("");
  });
});

describe("postHref", () => {
  it("accepts only our own post paths", () => {
    expect(postHref("/blog/solo-leveling")).toBe("/blog/solo-leveling");
    expect(postHref("https://evil.example/blog/x")).toBeNull();
    expect(postHref("//evil.example")).toBeNull();
    expect(postHref("/blog/../admin")).toBeNull();
    expect(postHref("/blog/Upper")).toBeNull();
    expect(postHref("/category/anime")).toBeNull();
  });
});

describe("POST_TYPE_LABEL", () => {
  it("labels every post type", () => {
    expect(Object.keys(POST_TYPE_LABEL).sort()).toEqual(["explainer", "list", "news", "review"]);
  });
});