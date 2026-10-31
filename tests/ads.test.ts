import { describe, expect, it } from "vitest";
import type { ContentNode, ParagraphNode } from "../src/lib/api-types";
import { adPlacements } from "../src/lib/content/ads";

const p = (text: string): ParagraphNode => ({ type: "paragraph", content: [{ type: "text", text }] });
const empty: ParagraphNode = { type: "paragraph" };
const adBreak: ContentNode = { type: "customBlock", attrs: { id: "ad-break", config: [] } };
const sorted = (set: Set<number>) => [...set].sort((a, b) => a - b);

describe("adPlacements", () => {
  it("places a slot after every 4th paragraph, at most 3", () => {
    const nodes = Array.from({ length: 20 }, (_, i) => p(`P${i}`));
    const result = adPlacements(nodes, { in_article_every: 4, in_article_max: 3 });

    expect(sorted(result.after)).toEqual([3, 7, 11]);
    expect(result.replace.size).toBe(0);
  });

  it("counts only paragraphs with text", () => {
    const nodes: ContentNode[] = [
      p("a"),
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "H" }] },
      p("b"),
      empty,
      p("c"),
      p("d"),
    ];

    expect(sorted(adPlacements(nodes, { in_article_every: 2, in_article_max: 5 }).after)).toEqual([2, 5]);
  });

  it("uses only ad-break blocks when the post has any, capped at the maximum", () => {
    const nodes: ContentNode[] = [p("a"), p("b"), adBreak, p("c"), p("d"), p("e"), p("f"), adBreak, adBreak, adBreak];
    const result = adPlacements(nodes, { in_article_every: 4, in_article_max: 2 });

    expect(sorted(result.replace)).toEqual([2, 7]);
    expect(result.after.size).toBe(0);
  });

  it("places nothing for a zero or invalid rule", () => {
    const nodes = Array.from({ length: 12 }, (_, i) => p(`P${i}`));

    expect(adPlacements(nodes, { in_article_every: 4, in_article_max: 0 }).after.size).toBe(0);
    expect(adPlacements(nodes, { in_article_every: 0, in_article_max: 3 }).after.size).toBe(0);
    expect(adPlacements(nodes, { in_article_every: Number.NaN, in_article_max: 3 }).after.size).toBe(0);
  });
});