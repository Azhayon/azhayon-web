import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/posts/Pagination";
import { PostCard } from "@/components/posts/PostCard";
import { getCategories } from "@/lib/api/endpoints";
import { BROWSE_SORTS, BROWSE_TYPES, browseParams, parseBrowse, queryHref, SORT_LABELS, TYPE_LABELS, type RawParams } from "@/lib/browse";
import { loadPostsPage } from "@/lib/listing";

// Filter screens are thin content: never indexed, and everything points back to /blog.
export const metadata: Metadata = {
  title: "Browse",
  description: "Filter posts by category, type and sort order.",
  alternates: { canonical: "/blog" },
  robots: { index: false, follow: true },
};

async function loadCategories() {
  try {
    return (await getCategories()).data;
  } catch {
    return [];
  }
}

const FIELD = "h-9 rounded-md border border-line bg-surface px-3 text-sm text-fg";

export default async function BrowsePage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const [raw, categories] = await Promise.all([searchParams, loadCategories()]);
  const query = parseBrowse(raw, categories.map((category) => category.slug));

  if (!query) {
    notFound();
  }

  const { data, meta } = await loadPostsPage({ category: query.category, type: query.type, sort: query.sort }, query.page);
  const params = browseParams(query);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="font-heading text-3xl font-extrabold">Browse</h1>

      <form action="/browse" method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-line bg-surface p-4">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Category
          <select name="category" defaultValue={query.category ?? ""} className={FIELD}>
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-muted">
          Type
          <select name="type" defaultValue={query.type ?? ""} className={FIELD}>
            <option value="">All</option>
            {BROWSE_TYPES.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-muted">
          Sort by
          <select name="sort" defaultValue={query.sort} className={FIELD}>
            {BROWSE_SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {SORT_LABELS[sort]}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="h-9 rounded-md bg-accent px-4 text-sm font-bold text-on-accent hover:opacity-90">
          Apply
        </button>
      </form>

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {meta.total} {meta.total === 1 ? "post" : "posts"}
      </p>

      {data.length === 0 ? (
        <p className="py-16 text-center text-muted">No posts match these filters.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((post, index) => (
            <PostCard key={post.slug} post={post} preload={query.page === 1 && index === 0} />
          ))}
        </div>
      )}

      <Pagination hrefFor={(target) => queryHref("/browse", params, target)} page={query.page} lastPage={meta.last_page} />
    </main>
  );
}