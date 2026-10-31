import Link from "next/link";
import type { PostSeries } from "@/lib/api-types";
import { postHref } from "@/lib/format";

export function SeriesNav({ series }: { series: PostSeries }) {
  const seriesHref = /^[a-z0-9-]+$/.test(series.slug) ? `/series/${series.slug}` : null;
  const previous = series.previous ? postHref(series.previous.path) : null;
  const next = series.next ? postHref(series.next.path) : null;

  return (
    <nav aria-label="Series" className="mt-10 space-y-3 rounded-lg border border-line bg-surface p-4">
      <p className="text-sm text-muted">
        Part of the series{" "}
        {seriesHref ? (
          <Link href={seriesHref} className="font-medium text-fg hover:text-accent">
            {series.title}
          </Link>
        ) : (
          <span className="font-medium text-fg">{series.title}</span>
        )}{" "}
        ({series.total} {series.total === 1 ? "post" : "posts"})
      </p>

      {(previous || next) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {previous && series.previous ? (
            <Link href={previous} className="rounded-md bg-raised p-3 hover:bg-raised-hover">
              <span className="block text-xs text-muted">← Previous</span>
              <span className="font-medium">{series.previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && series.next && (
            <Link href={next} className="rounded-md bg-raised p-3 text-right hover:bg-raised-hover sm:col-start-2">
              <span className="block text-xs text-muted">Next →</span>
              <span className="font-medium">{series.next.title}</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}