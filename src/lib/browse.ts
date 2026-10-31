import { parsePage } from "./paging";

export const BROWSE_TYPES = ["news", "review", "explainer", "list"] as const;
export const BROWSE_SORTS = ["newest", "popular", "rating", "oldest"] as const;

export type BrowseType = (typeof BROWSE_TYPES)[number];
export type BrowseSort = (typeof BROWSE_SORTS)[number];

export const TYPE_LABELS: Record<BrowseType, string> = { news: "News", review: "Reviews", explainer: "Explainers", list: "Lists" };
export const SORT_LABELS: Record<BrowseSort, string> = {
  newest: "Newest",
  popular: "Most viewed",
  rating: "Top rated",
  oldest: "Oldest",
};

export type RawParams = Record<string, string | string[] | undefined>;
export type BrowseQuery = { category?: string; type?: BrowseType; sort: BrowseSort; page: number };

const text = (raw: RawParams, key: string): string | undefined => {
  const value = raw[key];

  return typeof value === "string" ? value : undefined;
};

/** The page number from ?page=. Missing means 1; present but invalid means "not a page" (null). */
export function pageFrom(raw: RawParams): number | null {
  const value = raw.page;

  if (value === undefined) {
    return 1;
  }

  return typeof value === "string" ? parsePage(value) : null;
}

/** Reads the filters of /browse. Unknown values are ignored; a bad page number gives null (a 404). */
export function parseBrowse(raw: RawParams, categories: readonly string[]): BrowseQuery | null {
  const page = pageFrom(raw);

  if (page === null) {
    return null;
  }

  const category = text(raw, "category");
  const type = text(raw, "type");
  const sort = text(raw, "sort");

  return {
    category: category && categories.includes(category) ? category : undefined,
    type: BROWSE_TYPES.find((value) => value === type),
    sort: BROWSE_SORTS.find((value) => value === sort) ?? "newest",
    page,
  };
}

/** The filters as address parameters. The default sort is left out, so each view has one address. */
export function browseParams(query: BrowseQuery): Record<string, string | undefined> {
  return { category: query.category, type: query.type, sort: query.sort === "newest" ? undefined : query.sort };
}

/** An address with a canonical query string: keys sorted, empty values dropped, page last and only after page 1. */
export function queryHref(basePath: string, params: Record<string, string | undefined>, page = 1): string {
  const query = new URLSearchParams();

  for (const key of Object.keys(params).sort()) {
    const value = params[key];

    if (value) {
      query.set(key, value);
    }
  }

  if (page > 1) {
    query.set("page", String(page));
  }

  const queryString = query.toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
}