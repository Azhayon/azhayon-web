import type { Metadata } from "next";
import { TaxonomyPage, resolvePage, taxonomyMetadata } from "@/components/posts/TaxonomyPage";

type Props = { params: Promise<{ slug: string; page: string }> };

export const generateStaticParams = async () => [];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, page } = await params;

  return taxonomyMetadata("tag", slug, resolvePage("tag", slug, page));
}

export default async function Page({ params }: Props) {
  const { slug, page } = await params;

  return <TaxonomyPage kind="tag" slug={slug} page={resolvePage("tag", slug, page)} />;
}