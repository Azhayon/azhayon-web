import { beforeEach, describe, expect, it, vi } from "vitest";

const { jar } = vi.hoisted(() => ({
  jar: new Map<string, { value: string; path: string }>(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
    set: (name: string, value: string, options: { path?: string } = {}) => {
      jar.set(name, { value, path: options.path ?? "/" });
    },
    // Like a browser: only removes the cookie when the path matches.
    delete: (arg: string | { name: string; path?: string }) => {
      const name = typeof arg === "string" ? arg : arg.name;
      const path = typeof arg === "string" ? "/" : (arg.path ?? "/");
      if (jar.get(name)?.path === path) jar.delete(name);
    },
  }),
}));

import { OAUTH_COOKIE, setOAuthVerifier, takeOAuthVerifier } from "../src/lib/auth/cookies";

describe("oauth verifier cookie", () => {
  beforeEach(() => jar.clear());

  it("is returned once and then removed", async () => {
    await setOAuthVerifier("abc123");
    expect(await takeOAuthVerifier()).toBe("abc123");
    expect(jar.has(OAUTH_COOKIE)).toBe(false);
    expect(await takeOAuthVerifier()).toBeNull();
  });
});