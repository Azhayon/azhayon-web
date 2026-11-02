"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PostComment, PostCommentReply } from "@/lib/api-types";
import { fetchCommentsPage, mergeComments, type CommentsPage } from "@/lib/comments";
import { formatDate } from "@/lib/format";
import { PUBLIC_API_URL } from "@/lib/public-env";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; items: PostComment[]; page: number; lastPage: number; total: number; loadingMore: boolean; moreFailed: boolean };

const DOT = " \u00b7 ";

const toReady = (page: CommentsPage): State => ({
  status: "ready",
  items: page.items,
  page: page.page,
  lastPage: page.lastPage,
  total: page.commentsTotal,
  loadingMore: false,
  moreFailed: false,
});

function Meta({ comment }: { comment: PostCommentReply }) {
  const date = formatDate(comment.created_at);

  return (
    <p className="text-sm text-muted">
      <span className="font-semibold text-fg">{comment.author}</span>
      {date && (
        <>
          {DOT}
          <time dateTime={comment.created_at}>{date}</time>
        </>
      )}
    </p>
  );
}

/** Bodies are plain text: React escapes them, and line breaks are kept. */
function Body({ comment }: { comment: PostCommentReply }) {
  const [shown, setShown] = useState(!comment.is_spoiler);

  if (shown) {
    return <p className="whitespace-pre-line break-words">{comment.body}</p>;
  }

  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      className="rounded-md bg-raised px-3 py-2 text-sm text-muted hover:bg-raised-hover hover:text-fg"
    >
      This comment contains spoilers. Show it
    </button>
  );
}

function Skeleton() {
  return (
    <div aria-hidden className="space-y-6">
      {[0, 1, 2].map((row) => (
        <div key={row} className="space-y-2">
          <span className="block h-4 w-40 animate-pulse rounded bg-raised" />
          <span className="block h-4 w-full animate-pulse rounded bg-raised" />
          <span className="block h-4 w-2/3 animate-pulse rounded bg-raised" />
        </div>
      ))}
    </div>
  );
}

export function CommentsSection({ slug }: { slug: string }) {
  const headingId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<State>({ status: "loading" });

  // Wait until the reader is close, so the page itself stays fast.
  useEffect(() => {
    const node = rootRef.current;

    if (!node || started) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setStarted(true), 0);

      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || !PUBLIC_API_URL) {
      return;
    }

    const controller = new AbortController();

    fetchCommentsPage(PUBLIC_API_URL, slug, 1, controller.signal).then((page) => {
      if (!controller.signal.aborted) {
        setState(page ? toReady(page) : { status: "error" });
      }
    });

    return () => controller.abort();
  }, [started, slug]);

  function retry() {
    setState({ status: "loading" });

    fetchCommentsPage(PUBLIC_API_URL, slug, 1).then((page) => setState(page ? toReady(page) : { status: "error" }));
  }

  function loadMore() {
    if (state.status !== "ready" || state.loadingMore) {
      return;
    }

    const next = state.page + 1;

    setState({ ...state, loadingMore: true, moreFailed: false });

    fetchCommentsPage(PUBLIC_API_URL, slug, next).then((page) =>
      setState((current) => {
        if (current.status !== "ready") {
          return current;
        }

        return page
          ? { ...current, items: mergeComments(current.items, page.items), page: page.page, lastPage: page.lastPage, total: page.commentsTotal, loadingMore: false }
          : { ...current, loadingMore: false, moreFailed: true };
      }),
    );
  }

  if (!PUBLIC_API_URL) {
    return null;
  }

  return (
    <section
      ref={rootRef}
      aria-labelledby={headingId}
      aria-busy={state.status === "loading"}
      className="mx-auto mt-12 min-h-64 max-w-3xl border-t border-line pt-8"
    >
      <h2 id={headingId} className="font-heading text-2xl font-extrabold">
        Comments
        {state.status === "ready" && state.total > 0 && <span className="ml-2 text-lg text-muted">({state.total})</span>}
      </h2>

      <div className="mt-6">
        {state.status === "loading" && <Skeleton />}

        {state.status === "error" && (
          <p className="text-muted">
            Comments could not be loaded.{" "}
            <button type="button" onClick={retry} className="underline underline-offset-4 hover:text-fg">
              Try again
            </button>
          </p>
        )}

        {state.status === "ready" && state.items.length === 0 && <p className="text-muted">No comments yet.</p>}

        {state.status === "ready" && state.items.length > 0 && (
          <>
            <ul className="space-y-8">
              {state.items.map((comment) => (
                <li key={comment.id} className="space-y-2">
                  <Meta comment={comment} />
                  <Body comment={comment} />

                  {comment.replies.length > 0 && (
                    <ul className="mt-4 space-y-5 border-l border-line pl-4">
                      {comment.replies.map((reply) => (
                        <li key={reply.id} className="space-y-1">
                          <Meta comment={reply} />
                          <Body comment={reply} />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            {state.page < state.lastPage && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={state.loadingMore}
                  className="h-10 rounded-full bg-raised px-5 text-sm font-semibold hover:bg-raised-hover disabled:opacity-60"
                >
                  {state.loadingMore ? "Loading…" : "Show more comments"}
                </button>
                {state.moreFailed && <p className="mt-2 text-sm text-muted">Could not load more. Please try again.</p>}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}