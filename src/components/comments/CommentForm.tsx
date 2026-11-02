"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { postComment } from "@/app/engagement/actions";
import { failureFromError, type Failure } from "@/lib/action-result";
import type { CommentCreated } from "@/lib/api-types";
import { parseCommentInput } from "@/lib/engagement";

type Props = {
  slug: string;
  /** Set when replying. Replies are one level deep. */
  parentId?: number | null;
  label?: string;
  onPosted: (comment: CommentCreated) => void;
  /** Called when the server says the session is gone, so the page can show the sign-in prompt again. */
  onSignedOut: () => void;
};

const MAX = 2000;

export function CommentForm({ slug, parentId = null, label = "Add a comment", onPosted, onSignedOut }: Props) {
  const fieldId = useId();
  const [body, setBody] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [notice, setNotice] = useState("");

  const input = { body, parent_id: parentId, is_spoiler: spoiler };
  const checked = parseCommentInput(input);
  const count = Array.from(body.replace(/\r\n?/g, "\n").trim()).length;
  const problems = failure ? (Object.values(failure.fields ?? {}).length > 0 ? Object.values(failure.fields ?? {}) : [failure.message]) : [];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending || !checked.ok) {
      return;
    }

    setPending(true);
    setFailure(null);
    setNotice("");

    try {
      const result = await postComment(slug, input);

      if (result.ok) {
        setBody("");
        setSpoiler(false);
        setNotice("Thanks! Your comment is waiting for approval and will appear once a moderator has checked it.");
        onPosted(result.data);
      } else {
        setFailure(result);

        if (result.code === "signin") {
          onSignedOut();
        }
      }
    } catch (error) {
      setFailure(failureFromError(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <label htmlFor={fieldId} className="block text-sm font-semibold">
        {label}
      </label>

      <textarea
        id={fieldId}
        value={body}
        onChange={(event) => {
          setBody(event.target.value);
          setNotice("");
        }}
        rows={4}
        aria-describedby={`${fieldId}-help`}
        aria-invalid={failure?.fields?.body ? true : undefined}
        placeholder="Share your thoughts. Please be kind, and mark spoilers."
        className="w-full rounded-md border border-line bg-surface p-3 text-fg placeholder:text-muted"
      />

      <p id={`${fieldId}-help`} className="text-xs text-muted">
        2 to 2,000 characters, up to 2 links. A moderator checks each comment before it appears.{" "}
        <span aria-hidden className={count > MAX ? "text-accent" : undefined}>
          {count}/{MAX}
        </span>
      </p>

      {problems.length > 0 && (
        <div role="alert" className="space-y-1 text-sm text-accent">
          {problems.map((problem) => (
            <p key={problem}>{problem}</p>
          ))}
        </div>
      )}

      {notice && (
        <p role="status" className="text-sm text-cyan">
          {notice}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={spoiler} onChange={(event) => setSpoiler(event.target.checked)} />
          This comment contains spoilers
        </label>

        <button
          type="submit"
          disabled={pending || !checked.ok}
          className="h-10 rounded-full bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-cyan disabled:opacity-50"
        >
          {pending ? "Posting\u2026" : "Post comment"}
        </button>
      </div>
    </form>
  );
}