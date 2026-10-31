import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiImage } from "@/components/ApiImage";
import { PostContent } from "@/components/content/PostContent";
import { TableOfContents } from "@/components/posts/TableOfContents";
import { getPost } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import { buildToc } from "@/lib/content/toc";
import { formatDate, POST_TYPE_LABEL } from "@/lib/format";
import { buildPostMetadata, categoryHref, tagHref } from "@/lib/post-meta";

type Props = { params: Promise<{ slug: string }> };

/** Nothing is built ahead of time. Each post is generated on its first visit, then cached and refreshed by tag. */
export const generateStaticParams = async () => [];

async function loadPost(slug: string) {
  try {
    return (await getPost(slug)).data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  return buildPostMetadata(await loadPost(slug));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await loadPost(slug);

  const toc = buildToc(post.content.content);
  const published = formatDate(post.published_at);
  const updated = formatDate(post.updated_at);
  const showUpdated = updated !== "" && updated !== published;
  const category = categoryHref(post.category.slug);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <article>
        <header className="mx-auto max-w-3xl space-y-4">
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span className="rounded bg-raised px-2 py-0.5 text-fg">{POST_TYPE_LABEL[post.type]}</span>
            {category ? (
              <Link href={category} className="hover:text-fg">
                {post.category.name}
              </Link>
            ) : (
              <span>{post.category.name}</span>
            )}
          </p>

          <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-4xl">{post.title}</h1>
          {post.subtitle && <p className="text-lg text-muted">{post.subtitle}</p>}

          <p className="text-sm text-muted">
            By {post.author.name}
            {published && (
              <>
                {" · "}
                <time dateTime={post.published_at}>{published}</time>
              </>
            )}
            {showUpdated && (
              <>
                {" · Updated "}
                <time dateTime={post.updated_at}>{updated}</time>
              </>
            )}
            {" · "}
            {post.reading_time_minutes} min read
          </p>
        </header>

        {post.image && (
          <figure className="mx-auto mt-6 max-w-4xl">
            <ApiImage
              image={post.image}
              preload
              sizes="(min-width: 896px) 896px, 100vw"
              className="h-auto w-full rounded-lg"
            />
          </figure>
        )}

        <div className="mx-auto mt-8 max-w-3xl gap-10 lg:grid lg:max-w-5xl lg:grid-cols-[1fr_16rem]">
          {toc.length > 1 && (
            <aside className="mb-8 lg:order-2 lg:mb-0">
              <div className="lg:sticky lg:top-20">
                <TableOfContents entries={toc} />
              </div>
            </aside>
          )}

          <div className="min-w-0 lg:order-1">
            <PostContent content={post.content} />

            {post.tags.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
                {post.tags.map((tag) => {
                  const href = tagHref(tag.slug);

                  return (
                    <li key={tag.slug}>
                      {href ? (
                        <Link href={href} className="inline-block rounded-full bg-raised px-3 py-1 text-sm hover:bg-raised-hover">
                          {tag.name}
                        </Link>
                      ) : (
                        <span className="inline-block rounded-full bg-raised px-3 py-1 text-sm">{tag.name}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}