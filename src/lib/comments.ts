import type { PostComment, PostCommentReply } from "@/lib/api-types";

export type CommentsPage = { items: PostComment[]; page: number; lastPage: number; commentsTotal: number };

const SLUG = /^[a-z0-9-]+$/;

export function buildCommentsUrl(apiUrl: string, slug: string, page: number): string | null {
  const base = apiUrl.trim().replace(/\/+$/, "");

  if (!base || !SLUG.test(slug) || !Number.isInteger(page) || page < 1 || page > 500) {
    return null;
  }

  return `${base}/posts/${slug}/comments?page=${page}`;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;

/** Keeps only the fields we expect, so nothing unexpected from the network reaches the page. */
function parseReply(value: unknown): PostCommentReply | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, author, body, is_spoiler, created_at } = value;

  if (
    typeof id !== "number" || !Number.isInteger(id) ||
    typeof author !== "string" ||
    typeof body !== "string" ||
    typeof is_spoiler !== "boolean" ||
    typeof created_at !== "string"
  ) {
    return null;
  }

  return { id, author, body, is_spoiler, created_at };
}

function parseComment(value: unknown): PostComment | null {
  const base = parseReply(value);

  if (!base || !isRecord(value)) {
    return null;
  }

  const replies = Array.isArray(value.replies)
    ? value.replies.map(parseReply).filter((reply): reply is PostCommentReply => reply !== null)
    : [];

  return { ...base, replies };
}

/** The page of comments the API sent, or null when it is not in the shape we know. */
export function parseCommentsPage(json: unknown): CommentsPage | null {
  if (!isRecord(json) || !Array.isArray(json.data) || !isRecord(json.meta)) {
    return null;
  }

  const { page, last_page, comments_total } = json.meta;

  if (!isCount(page) || !isCount(last_page) || !isCount(comments_total)) {
    return null;
  }

  return {
    items: json.data.map(parseComment).filter((comment): comment is PostComment => comment !== null),
    page,
    lastPage: last_page,
    commentsTotal: comments_total,
  };
}

/** Adds a newly loaded page, skipping comments already shown (new ones can shift the paging). */
export function mergeComments(existing: PostComment[], incoming: PostComment[]): PostComment[] {
  const seen = new Set(existing.map((comment) => comment.id));

  return [...existing, ...incoming.filter((comment) => !seen.has(comment.id))];
}

export async function fetchCommentsPage(
  apiUrl: string,
  slug: string,
  page: number,
  signal?: AbortSignal,
): Promise<CommentsPage | null> {
  const url = buildCommentsUrl(apiUrl, slug, page);

  if (!url) {
    return null;
  }

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal });

    return response.ok ? parseCommentsPage(await response.json()) : null;
  } catch {
    return null;
  }
}