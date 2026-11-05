"use server";

import type { NewsletterMessage } from "@/lib/api-types";
import { failureFromError, invalidInput, type ActionResult } from "@/lib/action-result";
import { confirmNewsletter, subscribeNewsletter, unsubscribeNewsletter } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/http";
import { describeUnsubscribeFailure, parseConfirmToken, parseEmail, parseUnsubscribeToken } from "@/lib/newsletter";

// These three actions are public on purpose: a reader does not need to be signed in.
// The tokens and the API's own rate limits are what protect them.

export async function subscribe(email: unknown): Promise<ActionResult<NewsletterMessage>> {
  const value = parseEmail(email);

  if (value === null) {
    return invalidInput(["email"]);
  }

  try {
    const { data } = await subscribeNewsletter(value);

    return { ok: true, data };
  } catch (error) {
    return failureFromError(error);
  }
}

export async function confirmSubscription(token: unknown): Promise<ActionResult<NewsletterMessage>> {
  const value = parseConfirmToken(token);

  if (value === null) {
    return invalidInput(["token"]);
  }

  try {
    const { data } = await confirmNewsletter(value);

    return { ok: true, data };
  } catch (error) {
    return failureFromError(error);
  }
}

export async function unsubscribe(token: unknown): Promise<ActionResult<NewsletterMessage>> {
  const value = parseUnsubscribeToken(token);

  if (value === null) {
    return describeUnsubscribeFailure(404);
  }

  try {
    const { data } = await unsubscribeNewsletter(value);

    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return describeUnsubscribeFailure(error.status);
    }

    return failureFromError(error);
  }
}