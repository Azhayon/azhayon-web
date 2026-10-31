import { PostCard } from "@/components/posts/PostCard";
import { Pagination } from "@/components/posts/Pagination";
import type { PostCard as PostCardData } from "@/lib/api-types";

type Props = {
  heading: string;
  intro?: string | null;
  posts: PostCardData[];
  page: number;
  lastPage: number;
  basePath: string;
  emptyText?: string;
};

export function PostListing({ heading, intro, posts, page, lastPage, basePath, emptyText = "No posts yet." }: Props) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <header className="mb-6 space-y-2">
        <h1 className="font-heading text-3xl font-extrabold">{page > 1 ? `${heading}, page ${page}` : heading}</h1>
        {intro && <p className="max-w-3xl text-muted">{intro}</p>}
      </header>

      {posts.length === 0 ? (
        <p className="py-16 text-center text-muted">{emptyText}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <PostCard key={post.slug} post={post} preload={page === 1 && index === 0} />
          ))}
        </div>
      )}

      <Pagination basePath={basePath} page={page} lastPage={lastPage} />
    </main>
  );
}