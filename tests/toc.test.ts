import { describe, expect, it } from "vitest";
import type { ContentNode, HeadingNode, ParagraphNode } from "../src/lib/api-types";
import { buildToc, inlineText, slugify } from "../src/lib/content/toc";

const p = (text: string): ParagraphNode => ({ type: "paragraph", content: [{ type: "text", text }] });
const h = (level: 2 | 3 | 4, text: string): HeadingNode => ({
  type: "heading",
  attrs: { level },
  content: text ? [{ type: "text", text }] : [],
});

describe("inlineText", () => {
  it("joins text and treats a hard break as a space", () => {
    expect(inlineText([{ type: "text", text: "Hello" }, { type: "hardBreak" }, { type: "text", text: " world " }])).toBe(
      "Hello world",
    );
    expect(inlineText(undefined)).toBe("");
  });
});

describe("slugify", () => {
  it("lowercases and collapses punctuation", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  Café — Menu ")).toBe("café-menu");
  });

  it("keeps letters from other languages and folds full-width characters", () => {
    expect(slugify("進撃の巨人")).toBe("進撃の巨人");
    expect(slugify("Ａｎｉｍｅ")).toBe("anime");
  });

  it("falls back when nothing is left", () => {
    expect(slugify("!!!")).toBe("section");
  });
});

describe("buildToc", () => {
  it("lists headings with their top-level position and level", () => {
    const nodes: ContentNode[] = [p("intro"), h(2, "Plot"), p("x"), h(3, "Cast")];

    expect(buildToc(nodes)).toEqual([
      { index: 1, id: "plot", text: "Plot", level: 2 },
      { index: 3, id: "cast", text: "Cast", level: 3 },
    ]);
  });

  it("makes ids unique, even when a suffixed id already exists", () => {
    expect(buildToc([h(2, "A 2"), h(2, "A"), h(2, "A")]).map((entry) => entry.id)).toEqual(["a-2", "a", "a-3"]);
    expect(buildToc([h(2, "Plot"), h(3, "Plot")]).map((entry) => entry.id)).toEqual(["plot", "plot-2"]);
  });

  it("skips headings without text", () => {
    expect(buildToc([h(2, ""), h(2, "Real")])).toEqual([{ index: 1, id: "real", text: "Real", level: 2 }]);
  });
});