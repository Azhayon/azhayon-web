"use client";

import { useEffect, useId, useRef, useState } from "react";
import { removeRating, setRating } from "@/app/engagement/actions";
import { useSession } from "@/components/comments/useSession";
import { SignInButton } from "@/components/header/SignInButton";
import { useNearViewport } from "@/components/useNearViewport";
import { failureFromError } from "@/lib/action-result";
import { formatRatingSummary, parseMyRating, starFilled } from "@/lib/rating";

type Props = {
  slug: string;
  /** The numbers the cached page was built with. Fresh ones replace them once the reader's own rating loads. */
  average: number;
  count: number;
};

const STARS = [1, 2, 3, 4, 5] as const;

export function RatingWidget({ slug, average, count }: Props) {
  const headingId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const near = useNearViewport(rootRef);
  const { user, refresh } = useSession(near);

  const [summary, setSummary] = useState({ average, count });
  const [score, setScore] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const userId = user ? user.id : null;

  // The signed-in reader's own score, and the freshest numbers.
  useEffect(() => {
    if (userId === null) {
      return;
    }

    const controller = new AbortController();

    fetch(`/api/rating/${slug}`, { cache: "no-store", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((json: unknown) => {
        const mine = parseMyRating(json);

        if (mine && !controller.signal.aborted) {
          setScore(mine.score);
          setSummary({ average: mine.average, count: mine.count });
        }
      })
      .catch(() => {
        // Offline or cancelled: the page's own numbers stay.
      });

    return () => controller.abort();
  }, [userId, slug]);

  async function save(action: () => ReturnType<typeof setRating>, previous: number | null, thanks: string) {
    setPending(true);
    setMessage("");

    try {
      const result = await action();

      if (result.ok) {
        setScore(result.data.score);
        setSummary({ average: result.data.average, count: result.data.count });
        setMessage(thanks);
      } else {
        setScore(previous);
        setMessage(result.message);

        if (result.code === "signin") {
          refresh();
        }
      }
    } catch (error) {
      setScore(previous);
      setMessage(failureFromError(error).message);
    } finally {
      setPending(false);
    }
  }

  function choose(next: number) {
    if (pending) {
      return;
    }

    const previous = score;

    setScore(next);
    void save(() => setRating(slug, next), previous, "Thanks for rating!");
  }

  function clear() {
    if (pending || score === null) {
      return;
    }

    const previous = score;

    setScore(null);
    void save(() => removeRating(slug), previous, "Your rating was removed.");
  }

  return (
    <section
      ref={rootRef}
      aria-labelledby={headingId}
      className="mx-auto mt-10 min-h-32 max-w-3xl rounded-lg bg-surface p-4 ring-1 ring-line"
    >
      <h2 id={headingId} className="font-heading text-lg font-bold">
        Rate this post
      </h2>

      <p className="mt-1 text-sm text-muted">{formatRatingSummary(summary.average, summary.count)}</p>

      <div className="mt-3 min-h-10">
        {user === null && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted">Sign in to rate this post.</p>
            <SignInButton />
          </div>
        )}

        {user && (
          <div className="flex flex-wrap items-center gap-4">
            <div role="group" aria-label="Your rating" className="flex items-center" onMouseLeave={() => setHover(null)}>
              {STARS.map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={pending}
                  onClick={() => choose(n)}
                  onMouseEnter={() => setHover(n)}
                  aria-label={`Rate ${n} out of 5`}
                  aria-pressed={score === n}
                  className={`h-10 w-9 text-3xl leading-none disabled:opacity-60 ${
                    starFilled(n, hover, score) ? "text-accent" : "text-muted"
                  }`}
                >
                  <span aria-hidden>{starFilled(n, hover, score) ? "\u2605" : "\u2606"}</span>
                </button>
              ))}
            </div>

            {score !== null && (
              <button
                type="button"
                onClick={clear}
                disabled={pending}
                className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline disabled:opacity-60"
              >
                Remove my rating
              </button>
            )}
          </div>
        )}
      </div>

      <p role="status" className="mt-2 min-h-5 text-sm text-muted">
        {message}
      </p>
    </section>
  );
}