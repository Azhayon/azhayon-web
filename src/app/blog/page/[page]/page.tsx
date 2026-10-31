import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PostListing } from "@/components/posts/PostListing";
import { listingMetadata } from "@/lib/listing-meta";
import { loadPostsPage } from "@/lib/listing";
import { parsePage } from "@/lib/paging";

type Props = { params: Promise<{ page: string }> };

/** Nothing is built ahead of time. Each page is generated on first visit, then cached and refreshed by tag. */
export const generateStaticParams = async () => [];

/** Page 1 has one address (/blog), and anything that is not a page number is a 404. */
async function resolvePage(params: Props["params"]): Promise<number> {
  const page = parsePage((await params).page);

  if (page === null) {
    notFound();
  }

  if (page === 1) {
    permanentRedirect("/blog");
  }

  return page;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await resolvePage(params);

  return listingMetadata({
    title: "Latest posts",
    description: "The newest news, reviews and guides on movies, anime, manhwa and manga.",
    basePath: "/blog",
    page,
  });
}

export default async function BlogPage({ params }: Props) {
  const page = await resolvePage(params);
  const { data, meta } = await loadPostsPage({}, page);

  return <PostListing heading="Latest posts" posts={data} page={page} lastPage={meta.last_page} basePath="/blog" />;
}