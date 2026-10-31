import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/posts/PostCard";
import { getHome } from "@/lib/api/endpoints";
import type { PostCard as PostCardData } from "@/lib/api-types";
import { formatDate, postHref } from "@/lib/format";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { serverEnv } from "@/lib/env";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { ogImages, twitterImages } from "@/lib/social";

const TITLE = `${SITE_NAME}: movies, anime, manhwa and manga`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, title: TITLE, description: SITE_DESCRIPTION, url: "/", images: ogImages() },
  twitter: { card: "summary_large_image", title: TITLE, description: SITE_DESCRIPTION, images: twitterImages() },
};

function PopularList({ posts }: { posts: PostCardData[] }) {
  return (
    <ol className="divide-y divide-line rounded-lg border border-line bg-surface">
      {posts.map((post, index) => {
        const href = postHref(post.path);
        const date = formatDate(post.published_at);

        return (
          <li key={post.slug} className="flex gap-3 p-3">
            <span className="font-heading text-2xl font-bold text-accent" aria-hidden="true">
              {index + 1}
            </span>
            <div className="min-w-0">
              {href ? (
                <Link href={href} className="font-medium leading-snug hover:text-accent">
                  {post.title}
                </Link>
              ) : (
                <span className="font-medium leading-snug">{post.title}</span>
              )}
              {date && (
                <p className="mt-1 text-xs text-muted">
                  <time dateTime={post.published_at}>{date}</time>
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default async function Home() {
  const { data } = await getHome();

  const featured = data.trending[0] ?? data.latest[0];
  const trendingMore = data.trending.slice(1, 4);
  const isEmpty = !featured && data.popular.length === 0;
  const site = { url: serverEnv().siteUrl, name: SITE_NAME };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-12 px-4 py-8">
      
      <JsonLd data={websiteJsonLd(site)} />
      <JsonLd data={organizationJsonLd(site)} />
      
      <h1 className="sr-only">{TITLE}</h1>

      {isEmpty && <p className="py-20 text-center text-muted">No posts yet. Check back soon.</p>}

      {featured && (
        <section aria-labelledby="trending-heading" className="space-y-4">
          <h2 id="trending-heading" className="text-xl font-bold">
            Trending now
          </h2>
          <PostCard post={featured} featured />
          {trendingMore.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trendingMore.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>
      )}

      {(data.latest.length > 0 || data.popular.length > 0) && (
        <div className="gap-8 lg:grid lg:grid-cols-[1fr_20rem]">
          {data.latest.length > 0 && (
            <section aria-labelledby="latest-heading" className="space-y-4">
              <h2 id="latest-heading" className="text-xl font-bold">
                Latest
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.latest.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}

          {data.popular.length > 0 && (
            <aside aria-labelledby="popular-heading" className="mt-10 space-y-4 lg:mt-0">
              <h2 id="popular-heading" className="text-xl font-bold">
                Most popular
              </h2>
              <PopularList posts={data.popular} />
            </aside>
          )}
        </div>
      )}
    </main>
  );
}