/** What a server action tells the browser. Every message is written here, so raw API text never reaches the page. */
export type FailureCode = "signin" | "banned" | "invalid" | "limit" | "missing" | "unavailable";

export type Failure = {
  ok: false;
  code: FailureCode;
  message: string;
  /** Field name to message, only for the form fields we know. */
  fields?: Record<string, string>;
};

export type Success<T> = { ok: true; data: T };

export type ActionResult<T> = Success<T> | Failure;

const MESSAGE: Record<FailureCode, string> = {
  signin: "Please sign in to continue.",
  banned: "Your account is not allowed to do this.",
  invalid: "Please check what you entered.",
  limit: "You are doing that too quickly. Please wait a minute and try again.",
  missing: "This post is no longer available.",
  unavailable: "Something went wrong on our side. Please try again in a moment.",
};

const FIELD_MESSAGE: Record<string, string> = {
  body: "Write 2 to 2,000 characters, with at most 2 links, and not the same comment you just posted.",
  parent_id: "That comment can no longer be replied to.",
  score: "Choose a rating from 1 to 5.",
};

const failure = (code: FailureCode, fields?: Record<string, string>): Failure => ({
  ok: false,
  code,
  message: MESSAGE[code],
  ...(fields ? { fields } : {}),
});

/** Turns an API status into a failure with our own words. */
export function describeFailure(status: number, errors?: Record<string, string[]>): Failure {
  if (status === 401) return failure("signin");
  if (status === 403) return failure("banned");
  if (status === 404) return failure("missing");
  if (status === 429) return failure("limit");

  if (status === 422) {
    return invalidInput(errors ? Object.keys(errors) : []);
  }

  return failure("unavailable");
}

/** For anything an action catches. Errors that carry a numeric status are described; everything else is "unavailable". */
export function failureFromError(error: unknown): Failure {
  if (typeof error === "object" && error !== null && typeof (error as { status?: unknown }).status === "number") {
    const { status, errors } = error as { status: number; errors?: Record<string, string[]> };

    return describeFailure(status, errors);
  }

  return failure("unavailable");
}

/** A failure for input that was refused before it reached the API. Only known field names get a message. */
export function invalidInput(names: readonly string[]): Failure {
  const fields: Record<string, string> = {};

  for (const name of names) {
    if (Object.hasOwn(FIELD_MESSAGE, name)) {
      fields[name] = FIELD_MESSAGE[name];
    }
  }

  return failure("invalid", fields);
}