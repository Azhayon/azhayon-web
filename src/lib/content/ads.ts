import type { ContentNode } from "@/lib/api-types";
import { inlineText } from "./toc";

export type AdRules = { in_article_every: number; in_article_max: number };

export type AdPlacements = {
  /** Top-level nodes that are an ad-break block and become an ad slot in place. */
  replace: Set<number>;
  /** Top-level nodes after which an automatic ad slot goes. */
  after: Set<number>;
};

function isAdBreak(node: ContentNode): boolean {
  return node.type === "customBlock" && node.attrs.id === "ad-break";
}

/**
 * Where in-article ads go. If the post has any ad-break block, only those are used (capped).
 * Otherwise a slot follows every Nth paragraph that has text, up to the maximum.
 * Headings, lists, images and empty paragraphs are not counted.
 */
export function adPlacements(nodes: readonly ContentNode[], rules: AdRules): AdPlacements {
  const every = Math.floor(rules.in_article_every);
  const max = Math.floor(rules.in_article_max);
  const placements: AdPlacements = { replace: new Set(), after: new Set() };

  if (!(max > 0)) {
    return placements;
  }

  const breaks = nodes.flatMap((node, index) => (isAdBreak(node) ? [index] : []));

  if (breaks.length > 0) {
    for (const index of breaks.slice(0, max)) {
      placements.replace.add(index);
    }

    return placements;
  }

  if (!(every > 0)) {
    return placements;
  }

  let paragraphs = 0;

  nodes.forEach((node, index) => {
    if (node.type !== "paragraph" || inlineText(node.content) === "") {
      return;
    }

    paragraphs += 1;

    if (paragraphs % every === 0 && placements.after.size < max) {
      placements.after.add(index);
    }
  });

  return placements;
}