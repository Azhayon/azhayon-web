import { describe, expect, it } from "vitest";
import { classifyHref, isYouTubeId, safeXPostUrl } from "../src/lib/content/links";

describe("classifyHref", () => {
  it("treats our own paths as internal", () => {
    expect(classifyHref("/blog/solo-leveling")).toEqual({ kind: "internal", href: "/blog/solo-leveling" });
    expect(classifyHref("/search?q=isekai#top")).toEqual({ kind: "internal", href: "/search?q=isekai#top" });
  });

  it("accepts http and https links as external and normalises them", () => {
    expect(classifyHref("https://Example.com/path")).toEqual({ kind: "external", href: "https://example.com/path" });
    expect(classifyHref("http://example.com")).toEqual({ kind: "external", href: "http://example.com/" });
  });

  it("accepts a plain mailto address", () => {
    expect(classifyHref("mailto:hello@example.com")).toEqual({ kind: "mailto", href: "mailto:hello@example.com" });
  });

  it("rejects everything else", () => {
    for (const href of [
      "javascript:alert(1)",
      "data:text/html,x",
      "//evil.example",
      "/\\evil",
      "foo/bar",
      "",
      " https://example.com",
      "ftp://example.com",
      "https://user:pass@example.com",
      "mailto:",
      "mailto:a b@example.com",
    ]) {
      expect(classifyHref(href), href).toBeNull();
    }
  });
});

describe("isYouTubeId", () => {
  it("needs exactly 11 safe characters", () => {
    expect(isYouTubeId("dQw4w9WgXcQ")).toBe(true);
    expect(isYouTubeId("dQw4w9WgXc")).toBe(false);
    expect(isYouTubeId("dQw4w9WgXcQ1")).toBe(false);
    expect(isYouTubeId('dQw4w9WgXc"')).toBe(false);
  });
});

describe("safeXPostUrl", () => {
  it("allows https links to X only", () => {
    expect(safeXPostUrl("https://x.com/user/status/123")).toBe("https://x.com/user/status/123");
    expect(safeXPostUrl("https://twitter.com/u/status/1")).toBe("https://twitter.com/u/status/1");
    expect(safeXPostUrl("http://x.com/u")).toBeNull();
    expect(safeXPostUrl("https://evil.example/x.com")).toBeNull();
    expect(safeXPostUrl("https://x.com.evil.example/u")).toBeNull();
    expect(safeXPostUrl("https://user:p@x.com/u")).toBeNull();
  });
});