import { PostListing } from "@/components/posts/PostListing";
import { listingMetadata } from "@/lib/listing-meta";
import { loadPostsPage } from "@/lib/listing";

export const metadata = listingMetadata({
  title: "Latest posts",
  description: "The newest news, reviews and guides on movies, anime, manhwa and manga.",
  basePath: "/blog",
  page: 1,
});

export default async function BlogIndex() {
  const { data, meta } = await loadPostsPage({}, 1);

  return <PostListing heading="Latest posts" posts={data} page={1} lastPage={meta.last_page} basePath="/blog" />;
}