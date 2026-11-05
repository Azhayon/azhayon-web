import { beforeEach, describe, expect, it, vi } from "vitest";

const { jar } = vi.hoisted(() => ({
  jar: new Map<string, { value: string; options: Record<string, unknown> }>(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
    set: (name: string, value: string, options: Record<string, unknown> = {}) => {
      if (options.maxAge === 0) jar.delete(name);
      else jar.set(name, { value, options });
    },
  }),
}));

import { setReturnPath, takeReturnPath } from "../src/lib/auth/return-cookie";
import { RETURN_COOKIE } from "../src/lib/return-path";

describe("return cookie", () => {
  beforeEach(() => jar.clear());

  it("stores a safe path with strict cookie options", async () => {
    await setReturnPath("/blog/some-post");
    const stored = jar.get(RETURN_COOKIE)!;
    expect(stored.value).toBe("/blog/some-post");
    expect(stored.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/auth", maxAge: 600 });
  });

  it("stores nothing for an unsafe path and clears a stale value", async () => {
    await setReturnPath("/blog/old");
    await setReturnPath("//evil.com");
    expect(jar.has(RETURN_COOKIE)).toBe(false);
  });

  it("take returns the path once, then null", async () => {
    await setReturnPath("/blog/some-post?x=1");
    expect(await takeReturnPath()).toBe("/blog/some-post?x=1");
    expect(await takeReturnPath()).toBeNull();
  });

  it("take re-validates a tampered cookie", async () => {
    jar.set(RETURN_COOKIE, { value: "https://evil.com", options: {} });
    expect(await takeReturnPath()).toBeNull();
    expect(jar.has(RETURN_COOKIE)).toBe(false);
  });
});