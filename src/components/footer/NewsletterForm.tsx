"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { subscribe } from "@/app/newsletter/actions";
import { failureFromError, invalidInput, type Failure } from "@/lib/action-result";
import { SUBSCRIBE_PENDING_MESSAGE, isHoneypotTripped, parseEmail } from "@/lib/newsletter";

export function NewsletterForm() {
  const fieldId = useId();
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [notice, setNotice] = useState("");

  const problem = failure ? (Object.values(failure.fields ?? {})[0] ?? failure.message) : "";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) {
      return;
    }

    setFailure(null);
    setNotice("");

    if (isHoneypotTripped(trap)) {
      // Pretend it worked, without calling the API.
      setNotice(SUBSCRIBE_PENDING_MESSAGE);
      setEmail("");

      return;
    }

    if (parseEmail(email) === null) {
      setFailure(invalidInput(["email"]));

      return;
    }

    setPending(true);

    try {
      const result = await subscribe(email);

      if (result.ok) {
        setEmail("");
        setNotice(result.data.message);
      } else {
        setFailure(result);
      }
    } catch (error) {
      setFailure(failureFromError(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-xl space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-semibold">
        Get new posts by email
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={fieldId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={failure?.fields?.email ? true : undefined}
          placeholder="you@example.com"
          className="h-10 w-full rounded-md border border-line bg-surface px-3 text-base text-fg placeholder:text-muted sm:text-sm"
        />

        {/* Honeypot: off-screen, skipped by keyboards and screen readers. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(event) => setTrap(event.target.value)} />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="h-10 shrink-0 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-cyan disabled:opacity-50"
        >
          {pending ? "Subscribing\u2026" : "Subscribe"}
        </button>
      </div>

      {/* Reserved height, so a message appearing never moves the footer. */}
      <div aria-live="polite" className="min-h-10 text-sm">
        {problem && <p className="text-accent">{problem}</p>}
        {notice && <p className="text-cyan">{notice}</p>}
      </div>
    </form>
  );
}