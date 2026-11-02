"use server";

import type { CommentCreated, MyRating } from "@/lib/api-types";
import { describeFailure, failureFromError, invalidInput, type ActionResult } from "@/lib/action-result";
import { createComment, deleteRating, putRating } from "@/lib/api/endpoints";
import { parseCommentInput, parseScore } from "@/lib/engagement";
import { authorise } from "@/lib/engagement-server";
import { isSlug } from "@/lib/slug";

export async function postComment(slug: string, input: unknown): Promise<ActionResult<CommentCreated>> {
  const auth = await authorise();

  if (!auth.ok) {
    return auth;
  }

  if (typeof slug !== "string" || !isSlug(slug)) {
    return describeFailure(404);
  }

  const parsed = parseCommentInput(input);

  if (!parsed.ok) {
    return invalidInput(parsed.fields);
  }

  try {
    const { data } = await createComment(auth.token, slug, parsed.value);

    return { ok: true, data };
  } catch (error) {
    return failureFromError(error);
  }
}

export async function setRating(slug: string, score: unknown): Promise<ActionResult<MyRating>> {
  const auth = await authorise();

  if (!auth.ok) {
    return auth;
  }

  if (typeof slug !== "string" || !isSlug(slug)) {
    return describeFailure(404);
  }

  const value = parseScore(score);

  if (value === null) {
    return invalidInput(["score"]);
  }

  try {
    const { data } = await putRating(auth.token, slug, value);

    return { ok: true, data };
  } catch (error) {
    return failureFromError(error);
  }
}

export async function removeRating(slug: string): Promise<ActionResult<MyRating>> {
  const auth = await authorise();

  if (!auth.ok) {
    return auth;
  }

  if (typeof slug !== "string" || !isSlug(slug)) {
    return describeFailure(404);
  }

  try {
    const { data } = await deleteRating(auth.token, slug);

    return { ok: true, data };
  } catch (error) {
    return failureFromError(error);
  }
}