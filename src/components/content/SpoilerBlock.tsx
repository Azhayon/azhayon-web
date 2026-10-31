"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";

/** Hidden until the visitor activates it. A real button, so it works with keyboard and screen readers. */
export function SpoilerBlock({ label, children }: { label: string; children: ReactNode }) {
  const [shown, setShown] = useState(false);
  const id = useId();

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <button
        type="button"
        aria-expanded={shown}
        aria-controls={id}
        onClick={() => setShown((value) => !value)}
        className="inline-flex items-center gap-2 rounded bg-raised px-3 py-2 text-sm font-medium hover:bg-raised-hover"
      >
        <span aria-hidden="true">{shown ? "▾" : "▸"}</span>
        {shown ? "Hide spoiler" : label}
      </button>
      <div id={id} hidden={!shown} className="mt-3 space-y-3">
        {children}
      </div>
    </div>
  );
}