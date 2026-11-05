"use client";

import Link from "next/link";
import { useState } from "react";
import { confirmSubscription, unsubscribe } from "@/app/newsletter/actions";
import { failureFromError, type Failure } from "@/lib/action-result";

type Props = { kind: "confirm" | "unsubscribe"; token: string };

const LABEL = {
  confirm: { idle: "Confirm my subscription", busy: "Confirming\u2026" },
  unsubscribe: { idle: "Unsubscribe me", busy: "Unsubscribing\u2026" },
} as const;

export function TokenAction({ kind, token }: Props) {
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [done, setDone] = useState("");

  const problem = failure ? (Object.values(failure.fields ?? {})[0] ?? failure.message) : "";

  async function press() {
    if (pending) {
      return;
    }

    setPending(true);
    setFailure(null);

    try {
      const result = await (kind === "confirm" ? confirmSubscription(token) : unsubscribe(token));

      if (result.ok) {
        setDone(result.data.message);
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
    <div className="mt-6 space-y-4">
      {!done && (
        <button
          type="button"
          onClick={press}
          disabled={pending}
          className="h-10 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-cyan disabled:opacity-50"
        >
          {pending ? LABEL[kind].busy : LABEL[kind].idle}
        </button>
      )}

      <div aria-live="polite" className="min-h-6 text-sm">
        {problem && <p className="text-accent">{problem}</p>}
        {done && <p className="text-cyan">{done}</p>}
      </div>

      {done && (
        <Link href="/" className="inline-block text-sm text-muted hover:text-fg">
          Back to Azhayon Media
        </Link>
      )}
    </div>
  );
}