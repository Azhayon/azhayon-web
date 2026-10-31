import type { Metadata } from "next";
import { TaxonomyPage, taxonomyMetadata } from "@/components/posts/TaxonomyPage";

type Props = { params: Promise<{ slug: string }> };

/** Nothing is built ahead of time. Each page is generated on first visit, then cached and refreshed by tag. */
export const generateStaticParams = async () => [];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  return taxonomyMetadata("series", slug, 1);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  return <TaxonomyPage kind="series" slug={slug} page={1} />;
}