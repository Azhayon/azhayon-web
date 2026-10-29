import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ALL_TAGS } from "../src/lib/cache-tags";
import { expandTags, MAX_TAGS, parseTags, sign, verifySignature } from "../src/lib/revalidation";

const secret = "s".repeat(40);
const now = 1_800_000_000;
const body = '{"tags":["posts","home"]}';

const header = (timestamp: number | string, text = body, key = secret) => `sha256=${sign(key, String(timestamp), text)}`;

const check = (overrides: Partial<Parameters<typeof verifySignature>[0]> = {}) =>
  verifySignature({ secret, timestamp: String(now), signature: header(now), rawBody: body, nowSeconds: now, ...overrides });

describe("sign", () => {
  it("is HMAC-SHA256, in hex, over timestamp + '.' + body", () => {
    expect(sign(secret, "123", body)).toBe(createHmac("sha256", secret).update(`123.${body}`).digest("hex"));
    expect(sign(secret, "123", body)).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("verifySignature", () => {
  it("accepts a correct, fresh signature, up to five minutes either side", () => {
    expect(check()).toBe(true);

    for (const offset of [-300, 300]) {
      const timestamp = now + offset;

      expect(check({ timestamp: String(timestamp), signature: header(timestamp) })).toBe(true);
    }
  });

  it("rejects stale and future timestamps", () => {
    for (const offset of [-301, 301, -86_400]) {
      const timestamp = now + offset;

      expect(check({ timestamp: String(timestamp), signature: header(timestamp) })).toBe(false);
    }
  });

  it("rejects a wrong secret, a changed body and a changed timestamp", () => {
    expect(check({ signature: header(now, body, "x".repeat(40)) })).toBe(false);
    expect(check({ rawBody: body.replace("home", "evil") })).toBe(false);
    expect(check({ timestamp: String(now + 1) })).toBe(false);
  });

  it("rejects missing or malformed headers", () => {
    const signatures = [
      null,
      "",
      "abc",
      "sha256=",
      `sha256=${"A".repeat(64)}`,
      `sha256=${"a".repeat(63)}`,
      `sha256=${"g".repeat(64)}`,
      `sha1=${"a".repeat(40)}`,
      `${header(now)}x`,
      ` ${header(now)}`,
    ];

    for (const signature of signatures) {
      expect(check({ signature }), String(signature)).toBe(false);
    }

    for (const timestamp of [null, "", "abc", "-1", "1e9", "12.5", "1".repeat(13)]) {
      expect(check({ timestamp }), String(timestamp)).toBe(false);
    }
  });
});

describe("parseTags", () => {
  it("accepts a list, removes duplicates and ignores unknown keys", () => {
    expect(parseTags('{"tags":["posts","home","posts","post:some-slug"]}')).toEqual({
      ok: true,
      tags: ["posts", "home", "post:some-slug"],
    });

    expect(parseTags('{"tags":["posts"],"extra":1}')).toEqual({ ok: true, tags: ["posts"] });
  });

  it("rejects anything that is not a sensible tag list", () => {
    const bodies = [
      "",
      "not json",
      "null",
      "[]",
      '"posts"',
      "{}",
      '{"tags":"posts"}',
      '{"tags":[]}',
      '{"tags":[1]}',
      '{"tags":[null]}',
      '{"tags":["Bad Tag"]}',
      '{"tags":["UPPER"]}',
      '{"tags":["../x"]}',
      '{"tags":[""]}',
      JSON.stringify({ tags: ["a".repeat(191)] }),
      JSON.stringify({ tags: Array.from({ length: MAX_TAGS + 1 }, (_, index) => `tag-${index}`) }),
    ];

    for (const text of bodies) {
      expect(parseTags(text).ok, text.slice(0, 60)).toBe(false);
    }
  });

  it("accepts the largest tag and the longest list allowed", () => {
    const longest = "a".repeat(190);

    expect(parseTags(JSON.stringify({ tags: [longest] }))).toEqual({ ok: true, tags: [longest] });

    const many = Array.from({ length: MAX_TAGS }, (_, index) => `tag-${index}`);

    expect(parseTags(JSON.stringify({ tags: many }))).toEqual({ ok: true, tags: many });
  });
});

describe("expandTags", () => {
  it("keeps normal tags and expands 'all' without duplicates", () => {
    expect(expandTags(["posts", "post:a"])).toEqual(["posts", "post:a"]);
    expect([...expandTags(["all"])].sort()).toEqual([...ALL_TAGS].sort());

    const mixed = expandTags(["posts", "all", "post:a"]);

    expect(mixed).toHaveLength(ALL_TAGS.length + 1);
    expect(new Set(mixed).size).toBe(mixed.length);
    expect(mixed).toContain("post:a");
  });
});