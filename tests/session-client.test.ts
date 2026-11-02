import { describe, expect, it } from "vitest";
import { parsePublicUser } from "@/lib/session-client";

const user = { id: 7, name: "Ayon", avatar_url: null, role: "user" };

describe("parsePublicUser", () => {
  it("reads a signed-in user", () => {
    expect(parsePublicUser({ user })).toEqual(user);
    expect(parsePublicUser({ user: { ...user, avatar_url: "https://x.test/a.png", role: "admin" } })?.role).toBe("admin");
  });

  it("treats a missing avatar as none", () => {
    const noAvatar = { id: 7, name: "Ayon", role: "user" };

    expect(parsePublicUser({ user: noAvatar })?.avatar_url).toBeNull();
  });

  it("keeps only the fields we expect", () => {
    expect(JSON.stringify(parsePublicUser({ user: { ...user, email: "a@b.c", token: "x" } }))).not.toMatch(/a@b\.c|token/);
  });

  it("is null when signed out or malformed", () => {
    for (const json of [null, "x", [], {}, { user: null }, { user: "Ayon" }, { user: { ...user, id: "7" } }, { user: { ...user, role: "owner" } }, { user: { ...user, name: 5 } }]) {
      expect(parsePublicUser(json)).toBeNull();
    }
  });
});