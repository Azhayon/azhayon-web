import type { ReactNode } from "react";
import { formatDate } from "@/lib/format";

type Props = { title: string; updated?: string; children: ReactNode };

const BODY =
  "mt-6 space-y-4 leading-relaxed [&_a]:text-cyan [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_h2]:pt-4 [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6";

export function LegalPage({ title, updated, children }: Props) {
  const date = updated ? formatDate(updated) : "";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="font-heading text-3xl font-extrabold">{title}</h1>
      {date && (
        <p className="mt-2 text-sm text-muted">
          Last updated <time dateTime={updated}>{date}</time>
        </p>
      )}
      <div className={BODY}>{children}</div>
    </main>
  );
}