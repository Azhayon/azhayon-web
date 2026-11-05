import { describeFailure, type Failure } from "@/lib/action-result";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A trimmed email that is plausible enough to send. The API does the real check. */
export function parseEmail(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const email = input.trim();

  return email.length <= 254 && EMAIL_SHAPE.test(email) ? email : null;
}

/** The API accepts 20 to 100 characters for a confirmation token. */
export function parseConfirmToken(input: unknown): string | null {
  return typeof input === "string" && input.length >= 20 && input.length <= 100 ? input : null;
}

/** The API accepts exactly 40 characters for an unsubscribe token. */
export function parseUnsubscribeToken(input: unknown): string | null {
  return typeof input === "string" && input.length === 40 ? input : null;
}

/** Unsubscribe has its own wording: the generic 404 text talks about posts. */
export function describeUnsubscribeFailure(status: number): Failure {
  if (status === 404 || status === 422) {
    return {
      ok: false,
      code: "missing",
      message: "This unsubscribe link is not valid. Please use the link in the most recent email we sent you.",
    };
  }

  return describeFailure(status);
}