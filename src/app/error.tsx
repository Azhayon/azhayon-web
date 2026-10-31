"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  // Refresh fetches the page again from the server; reset then clears the error boundary.
  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <main role="alert" className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-heading text-3xl font-extrabold">Something went wrong</h1>
      <p className="mt-3 text-muted">
        We could not load this page. This is usually temporary, so please try again in a moment.
      </p>

      <div className="mt-8 flex gap-3">
        <button type="button" onClick={retry} className="h-10 rounded-md bg-accent px-4 text-sm font-bold text-on-accent hover:opacity-90">
          Try again
        </button>
        <Link href="/" className="inline-flex h-10 items-center rounded-md bg-raised px-4 text-sm hover:bg-raised-hover">
          Go home
        </Link>
      </div>

      {error.digest && <p className="mt-6 text-xs text-muted">Reference: {error.digest}</p>}
    </main>
  );
}