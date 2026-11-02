import { describe, expect, it } from "vitest";
import { buildCommentsUrl, mergeComments, parseCommentsPage } from "@/lib/comments";

const reply = { id: 2, author: "Ayon", body: "Reply", is_spoiler: false, created_at: "2026-10-18T07:10:00Z" };
const comment = { id: 1, author: "Ayon", body: "Hello", is_spoiler: true, created_at: "2026-10-18T06:44:00Z", replies: [reply] };
const meta = { page: 1, per_page: 20, total: 1, last_page: 2, comments_total: 2 };

describe("buildCommentsUrl", () => {
  it("builds the address under the API", () => {
    expect(buildCommentsUrl("http://127.0.0.1:8000/api/v1/", "a-post", 2)).toBe(
      "http://127.0.0.1:8000/api/v1/posts/a-post/comments?page=2",
    );
  });

  it("refuses a missing API address, a bad slug and a bad page", () => {
    expect(buildCommentsUrl("", "a-post", 1)).toBeNull();
    expect(buildCommentsUrl("http://x/api/v1", "A-Post", 1)).toBeNull();
    expect(buildCommentsUrl("http://x/api/v1", "a/b", 1)).toBeNull();
    expect(buildCommentsUrl("http://x/api/v1", "a-post", 0)).toBeNull();
    expect(buildCommentsUrl("http://x/api/v1", "a-post", 501)).toBeNull();
    expect(buildCommentsUrl("http://x/api/v1", "a-post", 1.5)).toBeNull();
  });
});

describe("parseCommentsPage", () => {
  it("reads a valid page", () => {
    expect(parseCommentsPage({ data: [comment], meta })).toEqual({
      items: [comment],
      page: 1,
      lastPage: 2,
      commentsTotal: 2,
    });
  });

  it("drops fields we do not know", () => {
    const page = parseCommentsPage({ data: [{ ...comment, email: "a@b.c", replies: [{ ...reply, user_id: 9 }] }], meta });

    expect(JSON.stringify(page)).not.toContain("a@b.c");
    expect(JSON.stringify(page)).not.toContain("user_id");
  });

  it("skips broken comments and broken replies but keeps the rest", () => {
    const page = parseCommentsPage({
      data: [{ ...comment, replies: [reply, { id: "x" }, null] }, { id: 3, body: 5 }, "text", null],
      meta,
    });

    expect(page?.items).toHaveLength(1);
    expect(page?.items[0].replies).toEqual([reply]);
  });

  it("treats missing replies as none", () => {
    const { replies: _unused, ...withoutReplies } = comment;

    expect(parseCommentsPage({ data: [withoutReplies], meta })?.items[0].replies).toEqual([]);
  });

  it("returns null when the shape is wrong", () => {
    for (const json of [null, "x", [], {}, { data: [] }, { data: {}, meta }, { data: [], meta: { ...meta, page: "1" } }, { data: [], meta: { ...meta, last_page: -1 } }]) {
      expect(parseCommentsPage(json)).toBeNull();
    }
  });
});

describe("mergeComments", () => {
  it("appends new comments and skips ones already shown", () => {
    const other = { ...comment, id: 5, replies: [] };

    expect(mergeComments([comment], [comment, other]).map((c) => c.id)).toEqual([1, 5]);
  });
});