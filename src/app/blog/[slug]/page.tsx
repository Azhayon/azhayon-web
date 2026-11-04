import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { getPost, getSite } from "@/lib/api/endpoints";
import { inArticleAds } from "@/lib/ads";
import { serverEnv } from "@/lib/env";
import { articleJsonLd, breadcrumbJsonLd, reviewJsonLd } from "@/lib/jsonld";
import { SITE_NAME } from "@/lib/site";
import { ApiError } from "@/lib/api/http";
import { buildPostMetadata } from "@/lib/post-meta";
import { PostView } from "@/components/posts/PostView";
import { ViewBeacon } from "@/components/posts/ViewBeacon";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { RatingWidget } from "@/components/comments/RatingWidget";

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

async function loadAds() {
  try {
    return inArticleAds((await getSite()).data.ads);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  return buildPostMetadata(await loadPost(slug));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, ads] = await Promise.all([loadPost(slug), loadAds()]);
  const site = { url: serverEnv().siteUrl, name: SITE_NAME };
  const review = reviewJsonLd(post, site);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <JsonLd data={articleJsonLd(post, site)} />
      <JsonLd data={breadcrumbJsonLd(post, site)} />

      <ViewBeacon slug={slug} />

      {review ? <JsonLd data={review} /> : null}
      <PostView
        post={post}
        ads={ads}
        afterArticle={
          <>
            <RatingWidget slug={slug} average={post.rating.average} count={post.rating.count} />
            <CommentsSection slug={slug} />
          </>
        }
      />
    </main>
  );
}