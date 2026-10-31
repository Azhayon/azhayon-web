import Link from "next/link";
import { ApiImage } from "@/components/ApiImage";
import type { PostCard as PostCardData } from "@/lib/api-types";
import { formatDate, POST_TYPE_LABEL, postHref } from "@/lib/format";

type Props = {
  post: PostCardData;
  /** The one card whose image is the biggest thing on screen at load. */
  featured?: boolean;
};

export function PostCard({ post, featured = false }: Props) {
  const href = postHref(post.path);
  const date = formatDate(post.published_at);

  const image = post.image ? (
    <ApiImage
      image={post.image}
      preload={featured}
      sizes={featured ? "(min-width: 1024px) 576px, 100vw" : "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
    />
  ) : null;

  const title = href ? (
    <Link href={href} className="after:absolute after:inset-0 hover:text-accent">
      {post.title}
    </Link>
  ) : (
    post.title
  );

  return (
    <article
      className={`group relative overflow-hidden rounded-lg border border-line bg-surface ${
        featured ? "md:grid md:grid-cols-2" : "flex flex-col"
      }`}
    >
      <div className="aspect-video overflow-hidden bg-raised">{image}</div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded bg-raised px-2 py-0.5 text-fg">{POST_TYPE_LABEL[post.type]}</span>
          <span>{post.category.name}</span>
        </p>

        <h3 className={`font-heading font-bold leading-snug ${featured ? "text-2xl" : "text-lg"}`}>{title}</h3>

        {post.excerpt && <p className={`text-sm text-muted ${featured ? "line-clamp-4" : "line-clamp-2"}`}>{post.excerpt}</p>}

        <p className="mt-auto pt-2 text-xs text-muted">
          {date && <time dateTime={post.published_at}>{date}</time>}
          {date && " · "}
          {post.reading_time_minutes} min read
        </p>
      </div>
    </article>
  );
}