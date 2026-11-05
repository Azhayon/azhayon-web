import { describe, expect, it } from "vitest";
import {
  describeUnsubscribeFailure,
  parseConfirmToken,
  parseEmail,
  parseUnsubscribeToken,
} from "@/lib/newsletter";

describe("newsletter input", () => {
  it("trims a valid email", () => {
    expect(parseEmail("  reader@example.com ")).toBe("reader@example.com");
  });

  it("rejects anything that is not a plausible email", () => {
    for (const bad of [undefined, null, 42, "", "   ", "no-at-sign", "a@b", "a b@c.com", `${"a".repeat(250)}@x.com`]) {
      expect(parseEmail(bad)).toBeNull();
    }
  });

  it("accepts confirmation tokens of 20 to 100 characters only", () => {
    expect(parseConfirmToken("a".repeat(19))).toBeNull();
    expect(parseConfirmToken("a".repeat(20))).toBe("a".repeat(20));
    expect(parseConfirmToken("a".repeat(100))).toBe("a".repeat(100));
    expect(parseConfirmToken("a".repeat(101))).toBeNull();
    expect(parseConfirmToken(null)).toBeNull();
  });

  it("accepts unsubscribe tokens of exactly 40 characters", () => {
    expect(parseUnsubscribeToken("a".repeat(40))).toBe("a".repeat(40));
    expect(parseUnsubscribeToken("a".repeat(39))).toBeNull();
    expect(parseUnsubscribeToken(["a".repeat(40)])).toBeNull();
  });
});

describe("unsubscribe failures", () => {
  it("uses its own wording for 404 and 422, never the post message", () => {
    for (const status of [404, 422]) {
      const result = describeUnsubscribeFailure(status);

      expect(result.code).toBe("missing");
      expect(result.message).toContain("unsubscribe link");
      expect(result.message).not.toContain("post");
    }
  });

  it("falls back to the shared messages for other statuses", () => {
    expect(describeUnsubscribeFailure(429).code).toBe("limit");
    expect(describeUnsubscribeFailure(500).code).toBe("unavailable");
  });
});