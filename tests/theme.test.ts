import { describe, expect, it } from "vitest";
import { THEME_COOKIE, themeScript } from "../src/lib/theme";

/** Runs the real inline script against a pretend document with the given cookie. */
function run(readCookie: () => string): string | undefined {
  const dataset: Record<string, string> = {};
  const fakeDocument = { documentElement: { dataset } };

  Object.defineProperty(fakeDocument, "cookie", { get: readCookie });
  new Function("document", themeScript)(fakeDocument);

  return dataset.theme;
}

describe("theme script", () => {
  it("uses the cookie name the toggle writes", () => {
    expect(THEME_COOKIE).toBe("azm_theme");
    expect(themeScript).toContain("azm_theme");
  });

  it("defaults to dark", () => {
    expect(run(() => "")).toBe("dark");
  });

  it("reads light and dark from the cookie", () => {
    expect(run(() => "azm_theme=light")).toBe("light");
    expect(run(() => "azm_theme=dark")).toBe("dark");
    expect(run(() => "a=1; azm_theme=light; b=2")).toBe("light");
    expect(run(() => "a=1; azm_theme=light")).toBe("light");
  });

  it("ignores anything else", () => {
    expect(run(() => "azm_theme=purple")).toBe("dark");
    expect(run(() => "azm_theme=lighter")).toBe("dark");
    expect(run(() => "xazm_theme=light")).toBe("dark");
    expect(run(() => "other_azm_theme=light")).toBe("dark");
  });

  it("falls back to dark when cookies are unavailable", () => {
    expect(
      run(() => {
        throw new Error("cookies are blocked");
      }),
    ).toBe("dark");
  });
});