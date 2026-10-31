"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { Suggestion } from "@/lib/api-types";
import { PUBLIC_API_URL } from "@/lib/public-env";
import { buildSuggestUrl, cleanQuery, isSearchable, safeSuggestions } from "@/lib/suggest";

const DEBOUNCE_MS = 250;
const TYPE_LABEL = { series: "Series", tag: "Tag", subject: "Topic", post: "Post" } as const;

export function SearchBox({
  className = "relative hidden sm:block",
  inputClassName = "w-40 lg:w-56",
}: {
  className?: string;
  inputClassName?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const showList = open && items.length > 0 && isSearchable(cleanQuery(value));

  // Debounced lookup. A newer keystroke cancels the older request.
  useEffect(() => {
    const query = cleanQuery(value);

    if (!PUBLIC_API_URL || !isSearchable(query)) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(buildSuggestUrl(PUBLIC_API_URL, query), {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          setItems([]);

          return;
        }

        const next = safeSuggestions(await response.json());

        setItems(next);
        setActive(-1);
        setOpen(next.length > 0);
      } catch {
        // Cancelled or offline: simply show no suggestions.
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  // Close when the visitor clicks elsewhere.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);

    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function go(item: Suggestion) {
    setOpen(false);
    setActive(-1);
    router.push(item.path);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && items.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % items.length);
    } else if (event.key === "ArrowUp" && items.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index <= 0 ? items.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (event.key === "Enter" && showList && active >= 0) {
      event.preventDefault();
      go(items[active]);
    }
  }

  return (
    <div ref={rootRef} className={className}>
      <form
        role="search"
        action="/search"
        method="get"
        onSubmit={(event) => {
          if (!isSearchable(cleanQuery(value))) {
            event.preventDefault();
          }
        }}
      >
        <input
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => items.length > 0 && setOpen(true)}
          maxLength={80}
          autoComplete="off"
          placeholder="Search"
          aria-label="Search the site"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          className={`h-9 rounded-md border border-line bg-surface px-3 text-sm text-fg placeholder:text-muted ${inputClassName}`}
        />
      </form>

      <p className="sr-only" aria-live="polite">
        {showList ? `${items.length} suggestions available` : ""}
      </p>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute right-0 z-50 mt-1 max-h-80 w-72 overflow-auto rounded-md border border-line bg-surface py-1 text-sm shadow-lg"
        >
          {items.map((item, index) => (
            <li
              key={`${item.type}:${item.path}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => go(item)}
              onMouseEnter={() => setActive(index)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2 ${
                index === active ? "bg-raised text-fg" : "text-fg"
              }`}
            >
              <span className="truncate">{item.label}</span>
              <span className="shrink-0 text-xs text-muted">{TYPE_LABEL[item.type]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}