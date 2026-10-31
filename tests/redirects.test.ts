import { describe, expect, it } from "vitest";
import { buildRedirectMap, normalizePath, resolveRedirect, shouldSkipPath } from "../src/lib/redirects";

const site = "https://azhayonmedia.com";
const entry = (from: string, to: string, status = 301) => ({ from, to, status });

describe("normalizePath", () => {
  it("drops trailing slashes and keeps the root", () => {
    expect(normalizePath("/blog/old/")).toBe("/blog/old");
    expect(normalizePath("/blog/old//")).toBe("/blog/old");
    expect(normalizePath("/blog/old")).toBe("/blog/old");
    expect(normalizePath("/")).toBe("/");
  });
});

describe("buildRedirectMap", () => {
  it("keeps valid entries keyed by their path without a trailing slash", () => {
    const map = buildRedirectMap([entry("/blog/old/", "/blog/new"), entry("/a", "/b", 302)], site);

    expect(map.get("/blog/old")).toEqual({ to: "/blog/new", status: 301 });
    expect(map.get("/a")).toEqual({ to: "/b", status: 302 });
  });

  it("drops unsafe, odd-status, self-pointing and duplicate entries", () => {
    const map = buildRedirectMap(
      [
        entry("//evil.example", "/x"),
        entry("/a", "https://evil.example/x"),
        entry("/b", "javascript:alert(1)"),
        entry("/c", "/d", 200),
        entry("/e", "/e/"),
        entry("/f", "/g"),
        entry("/f", "/h"),
      ],
      site,
    );

    expect([...map.keys()]).toEqual(["/f"]);
    expect(map.get("/f")?.to).toBe("/g");
  });

  it("turns a full address on our own site into a path", () => {
    const map = buildRedirectMap([entry("/old", "https://azhayonmedia.com/blog/new?x=1")], site);

    expect(map.get("/old")?.to).toBe("/blog/new?x=1");
  });
});

describe("resolveRedirect", () => {
  it("finds a redirect and ignores a trailing slash on the request", () => {
    const map = buildRedirectMap([entry("/old", "/new")], site);

    expect(resolveRedirect(map, "/old/")).toEqual({ to: "/new", status: 301 });
    expect(resolveRedirect(map, "/other")).toBeNull();
  });

  it("follows a chain to its end in one step, with the first status", () => {
    const map = buildRedirectMap([entry("/a", "/b", 301), entry("/b", "/c", 302)], site);

    expect(resolveRedirect(map, "/a")).toEqual({ to: "/c", status: 301 });
  });

  it("gives up on loops and very long chains", () => {
    const loop = buildRedirectMap([entry("/a", "/b"), entry("/b", "/a")], site);
    const long = buildRedirectMap(Array.from({ length: 10 }, (_, i) => entry(`/p${i}`, `/p${i + 1}`)), site);

    expect(resolveRedirect(loop, "/a")).toBeNull();
    expect(resolveRedirect(long, "/p0")).toBeNull();
  });
});

describe("shouldSkipPath", () => {
  it("skips framework, api, auth and file paths", () => {
    for (const path of ["/_next/static/a.js", "/api/revalidate", "/auth/session", "/robots.txt", "/sitemap.xml", "/favicon.ico", "/uploads/a.webp"]) {
      expect(shouldSkipPath(path), path).toBe(true);
    }
  });

  it("does not skip pages", () => {
    for (const path of ["/", "/blog/solo-leveling", "/category/anime/page/2"]) {
      expect(shouldSkipPath(path), path).toBe(false);
    }
  });
});