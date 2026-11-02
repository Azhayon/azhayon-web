import { describe, expect, it } from "vitest";
import { countLinks, parseCommentInput, parseScore } from "@/lib/engagement";

describe("parseScore", () => {
  it("accepts whole numbers from 1 to 5", () => {
    for (const score of [1, 2, 3, 4, 5]) {
      expect(parseScore(score)).toBe(score);
    }
  });

  it("refuses everything else", () => {
    for (const score of [0, 6, -1, 4.5, NaN, Infinity, "4", true, null, undefined, [4], {}]) {
      expect(parseScore(score)).toBeNull();
    }
  });
});

describe("parseCommentInput", () => {
  it("accepts and tidies a normal comment", () => {
    expect(parseCommentInput({ body: "  Hello\r\nworld  " })).toEqual({
      ok: true,
      value: { body: "Hello\nworld", parent_id: null, is_spoiler: false },
    });
  });

  it("accepts a reply and a spoiler flag", () => {
    expect(parseCommentInput({ body: "Nice", parent_id: 12, is_spoiler: true })).toEqual({
      ok: true,
      value: { body: "Nice", parent_id: 12, is_spoiler: true },
    });
  });

  it("counts characters, not code units", () => {
    expect(parseCommentInput({ body: "😀" }).ok).toBe(false);
    expect(parseCommentInput({ body: "😀😀" }).ok).toBe(true);
    expect(parseCommentInput({ body: "a".repeat(2000) }).ok).toBe(true);
    expect(parseCommentInput({ body: "a".repeat(2001) }).ok).toBe(false);
  });

  it("refuses empty, missing and non-text bodies", () => {
    for (const body of ["", " ", "a", undefined, null, 42, ["x"]]) {
      expect(parseCommentInput({ body })).toEqual({ ok: false, fields: ["body"] });
    }
  });

  it("allows two links but not three", () => {
    expect(countLinks("see https://a.com, www.b.com and HTTP://c.com")).toBe(3);
    expect(parseCommentInput({ body: "https://a.com https://b.com" }).ok).toBe(true);
    expect(parseCommentInput({ body: "https://a.com https://b.com https://c.com" })).toEqual({
      ok: false,
      fields: ["body"],
    });
  });

  it("refuses a bad parent id", () => {
    for (const parent_id of [0, -1, 1.5, "3", NaN, true]) {
      expect(parseCommentInput({ body: "Fine text", parent_id })).toEqual({ ok: false, fields: ["parent_id"] });
    }

    expect(parseCommentInput({ body: "Fine text", parent_id: null }).ok).toBe(true);
  });

  it("refuses input that is not an object", () => {
    for (const input of [null, undefined, "text", 5]) {
      expect(parseCommentInput(input).ok).toBe(false);
    }
  });

  it("only an exact true makes a spoiler", () => {
    const result = parseCommentInput({ body: "Fine text", is_spoiler: "yes" });

    expect(result.ok && result.value.is_spoiler).toBe(false);
  });
});