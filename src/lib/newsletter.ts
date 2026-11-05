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


/** Shown after a successful sign-up, and also to bots that tripped the honeypot, so they learn nothing. */
export const SUBSCRIBE_PENDING_MESSAGE =
  "If this address can receive our newsletter, a confirmation email is on its way. Please check your inbox and spam folder.";

/** The hidden field is empty for people. Anything typed into it means a script filled in the form. */
export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === "string" && value.trim() !== "";
}