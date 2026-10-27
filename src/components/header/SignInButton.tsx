"use client";

import { useRef } from "react";

const linkClass =
  "block rounded-lg bg-raised px-4 py-3 text-center text-sm font-semibold text-fg ring-1 ring-line transition hover:bg-raised-hover hover:ring-cyan";

export function SignInButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="h-9 rounded-full bg-accent px-4 text-sm font-semibold text-on-accent transition hover:bg-cyan hover:text-on-accent"
      >
        Sign in
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="signin-title"
        // A click on the backdrop targets the dialog element itself.
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        className="m-auto w-[min(92vw,24rem)] rounded-2xl bg-surface p-0 text-fg ring-1 ring-line backdrop:bg-black/70"
      >
        <div className="p-6">
          <h2 id="signin-title" className="text-xl font-extrabold">
            Sign in to Azhayon Media
          </h2>
          <p className="mt-2 text-sm text-muted">
            Comment and rate posts. We only receive your name, avatar and verified email.
          </p>

            {/* Plain anchors on purpose: these are route handlers that set a cookie and
              redirect off-site, so next/link must not prefetch or client-route them. */}
          <div className="mt-5 space-y-3">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/auth/login/google" rel="nofollow" className={linkClass}>
              Continue with Google
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/auth/login/discord" rel="nofollow" className={linkClass}>
              Continue with Discord
            </a>
          </div>

          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="mt-4 w-full text-center text-sm text-muted underline-offset-4 hover:underline"
          >
            Cancel
          </button>
        </div>
      </dialog>
    </>
  );
}