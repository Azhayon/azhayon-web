import Link from "next/link";
import { Fragment } from "react";
import type { ReactNode } from "react";
import type { InlineNode, TextMark } from "@/lib/api-types";
import { classifyHref, EXTERNAL_REL, type LinkTarget } from "@/lib/content/links";

export const LINK_CLASS = "text-cyan underline underline-offset-2 hover:text-accent";

function applyMarks(text: string, marks: readonly TextMark[] | undefined): ReactNode {
  let node: ReactNode = text;
  let target: LinkTarget | null = null;

  for (const mark of marks ?? []) {
    if (mark.type === "bold") {
      node = <strong>{node}</strong>;
    } else if (mark.type === "italic") {
      node = <em>{node}</em>;
    } else if (mark.type === "link" && !target) {
      target = classifyHref(mark.attrs.href);
    }
  }

  if (!target) {
    return node; // no link, or an unsafe one: plain text
  }

  if (target.kind === "internal") {
    return (
      <Link href={target.href} className={LINK_CLASS}>
        {node}
      </Link>
    );
  }

  return (
    <a href={target.href} className={LINK_CLASS} rel={target.kind === "external" ? EXTERNAL_REL : undefined}>
      {node}
    </a>
  );
}

export function Inline({ nodes }: { nodes: readonly InlineNode[] | undefined }) {
  return (
    <>
      {(nodes ?? []).map((node, index) =>
        node.type === "text" ? <Fragment key={index}>{applyMarks(node.text, node.marks)}</Fragment> : <br key={index} />,
      )}
    </>
  );
}