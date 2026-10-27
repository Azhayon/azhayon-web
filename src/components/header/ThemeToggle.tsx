"use client";

import { setThemeCookie, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next: Theme = root.dataset.theme === "light" ? "dark" : "light";

    root.dataset.theme = next;
    setThemeCookie(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light theme"
      title="Switch theme"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-raised text-fg transition hover:bg-raised-hover"
    >
      <svg className="theme-sun h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="theme-moon h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}