"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { SearchBox } from "@/components/search/SearchBox";
import type { NavLink } from "@/lib/nav";

export function MobileMenu({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close after any navigation.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg hover:bg-raised"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 5h14M3 10h14M3 15h14" />}
        </svg>
      </button>

      <div id={panelId} hidden={!open} className="absolute inset-x-0 top-full border-b border-line bg-canvas shadow-lg">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-4">
          <SearchBox className="relative sm:hidden" inputClassName="w-full" />

          {links.length > 0 && (
            <nav aria-label="Categories">
              <ul className="flex flex-col">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded px-2 py-3 text-fg hover:bg-raised"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}