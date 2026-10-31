import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="font-heading text-6xl font-extrabold text-accent" aria-hidden="true">
        404
      </p>
      <h1 className="mt-4 font-heading text-3xl font-extrabold">Page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for does not exist, or it has moved.</p>

      <form role="search" action="/search" method="get" className="mt-8 flex w-full max-w-md gap-2">
        <label htmlFor="not-found-q" className="sr-only">
          Search the site
        </label>
        <input
          id="not-found-q"
          type="search"
          name="q"
          maxLength={80}
          autoComplete="off"
          placeholder="Search titles, series and tags"
          className="h-10 flex-1 rounded-md border border-line bg-surface px-3 text-fg placeholder:text-muted"
        />
        <button type="submit" className="h-10 rounded-md bg-accent px-4 text-sm font-bold text-on-accent hover:opacity-90">
          Search
        </button>
      </form>

      <p className="mt-6 flex gap-4 text-sm">
        <Link href="/" className="text-cyan underline underline-offset-2 hover:text-accent">
          Home
        </Link>
        <Link href="/blog" className="text-cyan underline underline-offset-2 hover:text-accent">
          Latest posts
        </Link>
      </p>
    </main>
  );
}