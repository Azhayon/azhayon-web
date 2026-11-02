export type CommentInput = { body: string; parent_id: number | null; is_spoiler: boolean };

export type Parsed<T> = { ok: true; value: T } | { ok: false; fields: string[] };

const MIN_BODY = 2;
const MAX_BODY = 2000;
const MAX_LINKS = 2;

export const countLinks = (text: string): number => (text.match(/https?:\/\/|www\./gi) ?? []).length;

/** Checks what a comment form sent. The same limits as the API, counted in characters, not code units. */
export function parseCommentInput(input: unknown): Parsed<CommentInput> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, fields: ["body"] };
  }

  const raw = input as Record<string, unknown>;
  const fields: string[] = [];

  const body = typeof raw.body === "string" ? raw.body.replace(/\r\n?/g, "\n").trim() : "";
  const length = Array.from(body).length;

  if (length < MIN_BODY || length > MAX_BODY || countLinks(body) > MAX_LINKS) {
    fields.push("body");
  }

  let parentId: number | null = null;

  if (raw.parent_id !== undefined && raw.parent_id !== null) {
    if (typeof raw.parent_id === "number" && Number.isSafeInteger(raw.parent_id) && raw.parent_id > 0) {
      parentId = raw.parent_id;
    } else {
      fields.push("parent_id");
    }
  }

  if (fields.length > 0) {
    return { ok: false, fields };
  }

  return { ok: true, value: { body, parent_id: parentId, is_spoiler: raw.is_spoiler === true } };
}

/** A rating is a whole number from 1 to 5, and nothing else. */
export function parseScore(input: unknown): number | null {
  return typeof input === "number" && Number.isInteger(input) && input >= 1 && input <= 5 ? input : null;
}