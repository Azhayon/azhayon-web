import Link from "next/link";
import { pagePath, pageWindow } from "@/lib/paging";

type Props = { basePath: string; page: number; lastPage: number };

const BASE = "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm";

export function Pagination({ basePath, page, lastPage }: Props) {
  const items = pageWindow(page, lastPage);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={pagePath(basePath, page - 1)} rel="prev" className={`${BASE} bg-raised hover:bg-raised-hover`}>
          ← Previous
        </Link>
      ) : null}

      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} aria-hidden="true" className={`${BASE} text-muted`}>
            …
          </span>
        ) : item === page ? (
          <span key={item} aria-current="page" className={`${BASE} bg-accent font-bold text-on-accent`}>
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={pagePath(basePath, item)}
            aria-label={`Page ${item}`}
            className={`${BASE} bg-raised hover:bg-raised-hover`}
          >
            {item}
          </Link>
        ),
      )}

      {page < lastPage ? (
        <Link href={pagePath(basePath, page + 1)} rel="next" className={`${BASE} bg-raised hover:bg-raised-hover`}>
          Next →
        </Link>
      ) : null}
    </nav>
  );
}