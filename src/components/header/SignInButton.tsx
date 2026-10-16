"use client";

import { useRef } from "react";

const linkClass =
  "block rounded-lg bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-[#00E5FF]";

export function SignInButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="h-9 rounded-full bg-[#FF3366] px-4 text-sm font-semibold text-white transition hover:bg-[#00E5FF] hover:text-black"
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
        className="m-auto w-[min(92vw,24rem)] rounded-2xl bg-[#1E1E1E] p-0 text-white ring-1 ring-white/10 backdrop:bg-black/70"
      >
        <div className="p-6">
          <h2 id="signin-title" className="text-xl font-extrabold">
            Sign in to Azhayon Media
          </h2>
          <p className="mt-2 text-sm text-[#E0E0E0]">
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
            className="mt-4 w-full text-center text-sm text-[#E0E0E0] underline-offset-4 hover:underline"
          >
            Cancel
          </button>
        </div>
      </dialog>
    </>
  );
}