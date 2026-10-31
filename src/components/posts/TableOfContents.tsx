import type { TocEntry } from "@/lib/content/toc";

const INDENT = { 2: "", 3: "pl-3", 4: "pl-6" } as const;

export function TableOfContents({ entries }: { entries: readonly TocEntry[] }) {
  if (entries.length < 2) {
    return null;
  }

  return (
    <nav aria-label="Table of contents" className="rounded-lg border border-line bg-surface p-4 text-sm">
      <p className="mb-2 font-heading font-bold">On this page</p>
      <ol className="space-y-1.5">
        {entries.map((entry) => (
          <li key={entry.id} className={INDENT[entry.level]}>
            <a href={`#${entry.id}`} className="text-muted hover:text-fg">
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}