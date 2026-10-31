import { PostCard } from "@/components/posts/PostCard";
import type { PostCard as PostCardData } from "@/lib/api-types";

export function RelatedPosts({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-heading" className="mt-14 space-y-4">
      <h2 id="related-heading" className="text-xl font-bold">
        Related posts
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 6).map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}