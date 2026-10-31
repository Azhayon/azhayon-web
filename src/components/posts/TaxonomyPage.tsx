import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PostListing } from "@/components/posts/PostListing";
import { loadPostsPage } from "@/lib/listing";
import { listingMetadata } from "@/lib/listing-meta";
import { parsePage } from "@/lib/paging";
import { SITE_NAME } from "@/lib/site";
import { isSlug } from "@/lib/slug";
import { loadTaxonomy, type TaxonomyKind } from "@/lib/taxonomy";

/** Checks the address of a /page/N route. Page 1 has one address; anything that is not a page is a 404. */
export function resolvePage(kind: TaxonomyKind, slug: string, rawPage: string): number {
  if (!isSlug(slug)) {
    notFound();
  }

  const page = parsePage(rawPage);

  if (page === null) {
    notFound();
  }

  if (page === 1) {
    permanentRedirect(`/${kind}/${slug}`);
  }

  return page;
}

export async function taxonomyMetadata(kind: TaxonomyKind, slug: string, page: number): Promise<Metadata> {
  if (!isSlug(slug)) {
    notFound();
  }

  const info = await loadTaxonomy(kind, slug);

  return listingMetadata({
    title: info.seo.title,
    description: info.seo.description?.trim() || info.intro?.trim() || `Posts about ${info.heading} on ${SITE_NAME}.`,
    basePath: info.basePath,
    page,
    noindex: info.seo.noindex,
  });
}

export async function TaxonomyPage({ kind, slug, page }: { kind: TaxonomyKind; slug: string; page: number }) {
  if (!isSlug(slug)) {
    notFound();
  }

  const info = await loadTaxonomy(kind, slug);
  const { data, meta } = await loadPostsPage(info.filters, page);

  return (
    <PostListing
      heading={info.heading}
      intro={info.intro}
      posts={data}
      page={page}
      lastPage={meta.last_page}
      basePath={info.basePath}
    />
  );
}