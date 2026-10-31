import { Fragment } from "react";
import type { ReactNode } from "react";
import { ApiImage } from "@/components/ApiImage";
import type {
  BlockquoteNode,
  BulletListNode,
  Content,
  ContentNode,
  ImageBlockConfig,
  ListItemNode,
  OrderedListNode,
  ParagraphNode,
  SpoilerBlockConfig,
  XPostBlockConfig,
} from "@/lib/api-types";
import { adPlacements, type AdRules } from "@/lib/content/ads";
import { EXTERNAL_REL, safeXPostUrl } from "@/lib/content/links";
import { buildToc, inlineText } from "@/lib/content/toc";
import { Inline, LINK_CLASS } from "./Inline";
import { SpoilerBlock } from "./SpoilerBlock";
import { YouTubeEmbed } from "./YouTubeEmbed";

type FlowNode = ParagraphNode | BulletListNode | OrderedListNode;

const IMAGE_SIZES = "(min-width: 768px) 720px, 100vw";

const HEADING_CLASS = {
  2: "scroll-mt-20 pt-4 text-2xl font-bold",
  3: "scroll-mt-20 pt-2 text-xl font-bold",
  4: "scroll-mt-20 text-lg font-semibold",
} as const;

function Paragraph({ node }: { node: ParagraphNode }) {
  if (inlineText(node.content) === "") {
    return null;
  }

  return (
    <p>
      <Inline nodes={node.content} />
    </p>
  );
}

function Flow({ nodes }: { nodes: readonly FlowNode[] }) {
  return (
    <>
      {nodes.map((child, index) =>
        child.type === "paragraph" ? <Paragraph key={index} node={child} /> : <List key={index} node={child} />,
      )}
    </>
  );
}

function ListItem({ item }: { item: ListItemNode }) {
  return (
    <li className="space-y-2 pl-1">
      <Flow nodes={item.content} />
    </li>
  );
}

function List({ node }: { node: BulletListNode | OrderedListNode }) {
  const items = node.content.map((item, index) => <ListItem key={index} item={item} />);

  if (node.type === "orderedList") {
    return (
      <ol start={node.attrs?.start} className="list-decimal space-y-2 pl-6">
        {items}
      </ol>
    );
  }

  return <ul className="list-disc space-y-2 pl-6">{items}</ul>;
}

function Quote({ node }: { node: BlockquoteNode }) {
  return (
    <blockquote className="space-y-3 border-l-4 border-accent pl-4 italic text-muted">
      <Flow nodes={node.content} />
    </blockquote>
  );
}

function ImageBlock({ config }: { config: ImageBlockConfig }) {
  if (!config.media) {
    return null;
  }

  return (
    <figure>
      <ApiImage image={config.media} alt={config.alt || undefined} sizes={IMAGE_SIZES} className="h-auto w-full rounded-lg" />
      {config.caption && <figcaption className="mt-2 text-center text-sm text-muted">{config.caption}</figcaption>}
    </figure>
  );
}

/** A static card that links to the post on X. X's own scripts are never loaded. */
function XPostCard({ config }: { config: XPostBlockConfig }) {
  const url = safeXPostUrl(config.url);

  if (!url) {
    return null;
  }

  const handle = config.handle.replace(/^@+/, "").replace(/[^A-Za-z0-9_]/g, "").slice(0, 15);

  return (
    <aside aria-label="Post from X" className="rounded-lg border border-line bg-surface p-4">
      {config.text && <blockquote className="whitespace-pre-line">{config.text}</blockquote>}
      <p className="mt-3 text-sm text-muted">
        {handle && `@${handle} · `}
        <a href={url} rel={EXTERNAL_REL} className={LINK_CLASS}>
          View on X
        </a>
      </p>
    </aside>
  );
}

function Spoiler({ config }: { config: SpoilerBlockConfig }) {
  return (
    <SpoilerBlock label={config.label.trim() || "Show spoiler"}>
      {config.text && <p className="whitespace-pre-line">{config.text}</p>}
      {config.media && (
        <ApiImage image={config.media} alt={config.image_alt || undefined} sizes={IMAGE_SIZES} className="h-auto w-full rounded-lg" />
      )}
    </SpoilerBlock>
  );
}

function Block({ node, headingId }: { node: ContentNode; headingId?: string }) {
  switch (node.type) {
    case "paragraph":
      return <Paragraph node={node} />;

    case "heading": {
      const Tag = node.attrs.level === 2 ? "h2" : node.attrs.level === 3 ? "h3" : "h4";

      return (
        <Tag id={headingId} className={HEADING_CLASS[node.attrs.level]}>
          <Inline nodes={node.content} />
        </Tag>
      );
    }

    case "bulletList":
    case "orderedList":
      return <List node={node} />;

    case "blockquote":
      return <Quote node={node} />;

    case "horizontalRule":
      return <hr className="border-line" />;

    case "customBlock": {
      const attrs = node.attrs;

      switch (attrs.id) {
        case "image":
          return <ImageBlock config={attrs.config} />;
        case "youtube":
          return <YouTubeEmbed video={attrs.config.video} title={attrs.config.title} />;
        case "x-post":
          return <XPostCard config={attrs.config} />;
        case "spoiler":
          return <Spoiler config={attrs.config} />;
        default:
          return null; // ad-break: placed by the ad logic below, never rendered as content
      }
    }
  }
}

type Ads = {
  rules: AdRules;
  /** Draws one in-article ad slot. `position` counts 0, 1, 2 down the article. */
  render: (position: number) => ReactNode;
};

/** The body of a post. Pass `ads` only when ads are on and the in-article placement is enabled. */
export function PostContent({ content, ads }: { content: Content; ads?: Ads }) {
  const nodes = content.content;
  const headingIds = new Map(buildToc(nodes).map((entry) => [entry.index, entry.id]));
  const placements = ads ? adPlacements(nodes, ads.rules) : null;
  const out: ReactNode[] = [];
  let slot = 0;

  nodes.forEach((node, index) => {
    if (ads && placements?.replace.has(index)) {
      out.push(<Fragment key={index}>{ads.render(slot++)}</Fragment>);

      return;
    }

    out.push(
      <Fragment key={index}>
        <Block node={node} headingId={headingIds.get(index)} />
      </Fragment>,
    );

    if (ads && placements?.after.has(index)) {
      out.push(<Fragment key={`ad-${index}`}>{ads.render(slot++)}</Fragment>);
    }
  });

  return <div className="space-y-5 break-words text-[1.0625rem] leading-relaxed">{out}</div>;
}