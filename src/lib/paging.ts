export const PER_PAGE = 12;
export const MAX_PAGE = 500;

/** A page number from a URL: digits only, no leading zero, 1 to 500. Anything else is not a page. */
export function parsePage(raw: string): number | null {
  if (!/^[1-9]\d{0,2}$/.test(raw)) {
    return null;
  }

  const page = Number(raw);

  return page <= MAX_PAGE ? page : null;
}

/** Page 1 lives at the base path itself, so it has exactly one address. */
export function pagePath(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

export type PageItem = number | "gap";

/** The numbers to show: first, last, the current page and its neighbours, with gaps for the rest. */
export function pageWindow(current: number, last: number, span = 1): PageItem[] {
  if (last <= 1) {
    return [];
  }

  const pages = new Set<number>([1, last]);

  for (let page = current - span; page <= current + span; page += 1) {
    if (page >= 1 && page <= last) {
      pages.add(page);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: PageItem[] = [];

  sorted.forEach((page, index) => {
    if (index > 0) {
      const gap = page - sorted[index - 1];

      if (gap === 2) {
        items.push(page - 1);
      } else if (gap > 2) {
        items.push("gap");
      }
    }

    items.push(page);
  });

  return items;
}