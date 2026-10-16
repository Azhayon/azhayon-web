"use client";

import { useEffect, useState } from "react";

// Only known keys are ever shown; the URL value itself is never rendered.
const MESSAGES: Record<string, string> = {
  access_denied: "Sign-in was cancelled.",
  banned: "This account has been suspended.",
  account_disabled: "This account is no longer available.",
  oauth_failed: "The sign-in provider returned an error. Please try again.",
  invalid_state: "The sign-in session expired. Please try again.",
  invalid_request: "The sign-in request was invalid. Please try again.",
  exchange_failed: "We couldn't complete sign-in. Please try again.",
  unknown: "Something went wrong while signing in. Please try again.",
  rate_limited: "Too many sign-in attempts. Please wait a minute and try again.",
};

export function AuthNotice() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const key = url.searchParams.get("auth_error");

    if (!key) return;

    setMessage(MESSAGES[key] ?? MESSAGES.unknown);

    // Clean the URL so a refresh or a shared link doesn't repeat the message.
    url.searchParams.delete("auth_error");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);

  if (!message) return null;

  // Fixed position: appearing never shifts the page layout.
  return (
    <div
      role="alert"
      className="fixed left-1/2 top-16 z-50 flex w-[min(92vw,28rem)] -translate-x-1/2 items-start gap-3 rounded-xl bg-[#1E1E1E] p-4 text-sm text-white shadow-lg ring-1 ring-[#FF3366]"
    >
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => setMessage(null)}
        aria-label="Dismiss"
        className="text-[#E0E0E0] hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}