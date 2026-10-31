import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/posts/Pagination";
import { PostCard } from "@/components/posts/PostCard";
import { searchPosts } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import type { SearchResponse } from "@/lib/api-types";
import { pageFrom, queryHref, type RawParams } from "@/lib/browse";
import { PER_PAGE } from "@/lib/paging";
import { cleanQuery, isSearchable, MAX_QUERY_LENGTH } from "@/lib/suggest";

// Internal search results are thin content: never indexed, but links on them can be followed.
export const metadata: Metadata = {
  title: "Search",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

type Outcome = SearchResponse | "busy" | "invalid";

async function runSearch(query: string, page: number): Promise<Outcome> {
  try {
    return await searchPosts(query, { page, per_page: PER_PAGE });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        if (page === 1) {
          return { data: [], meta: { page: 1, per_page: PER_PAGE, total: 0, last_page: 1, query } };
        }

        notFound();
      }

      if (error.status === 429) {
        return "busy";
      }

      if (error.status === 422) {
        return "invalid";
      }
    }

    throw error;
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const page = pageFrom(raw);

  if (page === null) {
    notFound();
  }

  const query = cleanQuery(typeof raw.q === "string" ? raw.q : "");
  const ready = isSearchable(query);
  const outcome = ready ? await runSearch(query, page) : null;
  const result = outcome && typeof outcome === "object" ? outcome : null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <h1 className="font-heading text-3xl font-extrabold">Search</h1>

      <form role="search" action="/search" method="get" className="mt-6 flex max-w-xl gap-2">
        <label htmlFor="search-q" className="sr-only">
          Search the site
        </label>
        <input
          id="search-q"
          type="search"
          name="q"
          defaultValue={query}
          maxLength={MAX_QUERY_LENGTH}
          autoComplete="off"
          placeholder="Search titles, series and tags"
          className="h-10 flex-1 rounded-md border border-line bg-surface px-3 text-fg placeholder:text-muted"
        />
        <button type="submit" className="h-10 rounded-md bg-accent px-4 text-sm font-bold text-on-accent hover:opacity-90">
          Search
        </button>
      </form>

      {!ready && <p className="mt-6 text-muted">Type at least two letters or numbers to search.</p>}
      {outcome === "busy" && <p className="mt-6 text-muted">Too many searches just now. Please wait a minute and try again.</p>}
      {outcome === "invalid" && <p className="mt-6 text-muted">That search could not be used. Try different words.</p>}

      {result && (
        <>
          <p className="mt-6 text-sm text-muted" aria-live="polite">
            {result.meta.total} {result.meta.total === 1 ? "result" : "results"} for “{result.meta.query || query}”
          </p>

          {result.data.length === 0 ? (
            <p className="py-16 text-center text-muted">Nothing found. Try fewer or different words.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.map((post, index) => (
                <PostCard key={post.slug} post={post} preload={page === 1 && index === 0} />
              ))}
            </div>
          )}

          <Pagination hrefFor={(target) => queryHref("/search", { q: query }, target)} page={page} lastPage={result.meta.last_page} />
        </>
      )}
    </main>
  );
}