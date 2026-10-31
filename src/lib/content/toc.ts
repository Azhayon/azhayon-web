import type { ContentNode, InlineNode } from "@/lib/api-types";

export type TocEntry = { index: number; id: string; text: string; level: 2 | 3 | 4 };

/** The plain text of inline content. A hard break counts as a space. */
export function inlineText(nodes: readonly InlineNode[] | undefined): string {
  let text = "";

  for (const node of nodes ?? []) {
    text += node.type === "text" ? node.text : " ";
  }

  return text.replace(/\s+/g, " ").trim();
}

/** A readable anchor id. Keeps letters and numbers from any language. */
export function slugify(text: string): string {
  const slug = text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  const capped = Array.from(slug).slice(0, 80).join("").replace(/-+$/, "");

  return capped || "section";
}

/**
 * The table of contents. `index` is the heading's position among the top-level nodes,
 * so the renderer can look up the very same id. Ids are unique within the page.
 */
export function buildToc(nodes: readonly ContentNode[]): TocEntry[] {
  const taken = new Set<string>();
  const entries: TocEntry[] = [];

  nodes.forEach((node, index) => {
    if (node.type !== "heading") {
      return;
    }

    const text = inlineText(node.content);

    if (!text) {
      return;
    }

    const base = slugify(text);
    let id = base;
    let attempt = 1;

    while (taken.has(id)) {
      attempt += 1;
      id = `${base}-${attempt}`;
    }

    taken.add(id);
    entries.push({ index, id, text, level: node.attrs.level });
  });

  return entries;
}