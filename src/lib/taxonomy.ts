import "server-only";
import { notFound } from "next/navigation";
import { getCategory, getSeries, getTag, type PostsParams } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";

export type TaxonomyKind = "category" | "tag" | "series";

export type TaxonomyInfo = {
  heading: string;
  intro: string | null;
  basePath: string;
  filters: Omit<PostsParams, "page" | "per_page">;
  seo: { title: string; description: string | null; noindex: boolean };
};

async function fetchInfo(kind: TaxonomyKind, slug: string): Promise<TaxonomyInfo> {
  if (kind === "category") {
    const { data } = await getCategory(slug);

    return { heading: data.name, intro: data.description, basePath: `/category/${slug}`, filters: { category: slug }, seo: data.seo };
  }

  if (kind === "tag") {
    const { data } = await getTag(slug);

    return { heading: data.name, intro: null, basePath: `/tag/${slug}`, filters: { tag: slug }, seo: data.seo };
  }

  const { data } = await getSeries(slug);

  return {
    heading: data.title,
    intro: data.description,
    basePath: `/series/${slug}`,
    filters: { series: slug, sort: "oldest" },
    seo: data.seo,
  };
}

/** The details of one category, tag or series. Unknown or hidden ones are a 404; other errors are not hidden. */
export async function loadTaxonomy(kind: TaxonomyKind, slug: string): Promise<TaxonomyInfo> {
  try {
    return await fetchInfo(kind, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}