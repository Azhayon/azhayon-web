import { describe, expect, it } from "vitest";
import { safeReturnPath } from "../src/lib/return-path";
import { returnTarget, loginHref } from "../src/lib/return-path";


describe("safeReturnPath", () => {
  it("accepts normal site paths", () => {
    expect(safeReturnPath("/blog/some-post")).toBe("/blog/some-post");
    expect(safeReturnPath("/blog/page/2")).toBe("/blog/page/2");
    expect(safeReturnPath("/category/anime?x=1")).toBe("/category/anime?x=1");
  });

  it("rejects empty, relative and overlong input", () => {
    expect(safeReturnPath(null)).toBeNull();
    expect(safeReturnPath("")).toBeNull();
    expect(safeReturnPath("blog/post")).toBeNull();
    expect(safeReturnPath("/" + "a".repeat(400))).toBeNull();
  });

  it("rejects external and protocol-relative targets", () => {
    expect(safeReturnPath("//evil.com")).toBeNull();
    expect(safeReturnPath("https://evil.com")).toBeNull();
    expect(safeReturnPath("/\\evil.com")).toBeNull();
    expect(safeReturnPath("/\t/evil.com")).toBeNull();
  });

  it("rejects auth, api and preview paths (loops and credentials)", () => {
    expect(safeReturnPath("/auth/google")).toBeNull();
    expect(safeReturnPath("/auth")).toBeNull();
    expect(safeReturnPath("/api/revalidate")).toBeNull();
    expect(safeReturnPath("/preview/12")).toBeNull();
  });

  it("keeps a lookalike path that is not blocked", () => {
    expect(safeReturnPath("/authors")).toBe("/authors");
  });
});

describe("returnTarget", () => {
  it("falls back to the home page", () => {
    expect(returnTarget(null)).toBe("/");
  });
  it("returns the path unchanged without an error", () => {
    expect(returnTarget("/blog/some-post?x=1")).toBe("/blog/some-post?x=1");
  });
  it("adds auth_error, keeping an existing query", () => {
    expect(returnTarget("/blog/some-post", "access_denied")).toBe("/blog/some-post?auth_error=access_denied");
    expect(returnTarget("/blog/p?x=1", "banned")).toBe("/blog/p?x=1&auth_error=banned");
    expect(returnTarget(null, "banned")).toBe("/?auth_error=banned");
  });
});

describe("return path hash", () => {
  it("keeps a simple #section", () => {
    expect(safeReturnPath("/blog/p#comments")).toBe("/blog/p#comments");
  });
  it("drops an unusual hash", () => {
    expect(safeReturnPath("/blog/p#a.b")).toBe("/blog/p");
    expect(safeReturnPath("/blog/p#a%20b")).toBe("/blog/p");
  });
  it("returnTarget keeps the hash after auth_error", () => {
    expect(returnTarget("/blog/p#comments", "banned")).toBe("/blog/p?auth_error=banned#comments");
  });
});

describe("loginHref", () => {
  it("adds the encoded current path", () => {
    expect(loginHref("google", "/blog/some-post")).toBe("/auth/login/google?next=%2Fblog%2Fsome-post");
  });
  it("adds a safe hash", () => {
    expect(loginHref("discord", "/blog/some-post", "comments")).toBe(
      "/auth/login/discord?next=%2Fblog%2Fsome-post%23comments"
    );
  });
  it("ignores an unsafe hash", () => {
    expect(loginHref("google", "/blog/p", "a b")).toBe("/auth/login/google?next=%2Fblog%2Fp");
  });
  it("falls back to the plain link for blocked or missing paths", () => {
    expect(loginHref("google", "/auth/callback")).toBe("/auth/login/google");
    expect(loginHref("discord", null)).toBe("/auth/login/discord");
  });
});