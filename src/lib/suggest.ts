import type { Suggestion } from "@/lib/api-types";
import { buildApiUrl } from "./api/url";

export const MIN_QUERY_LENGTH = 2;
export const MAX_QUERY_LENGTH = 80;
export const MAX_SUGGESTIONS = 8;

const TYPES = new Set(["series", "tag", "subject", "post"]);

/** Our own site paths only: one leading slash, no scheme, no backslash. A query string is allowed (subjects link to search). */
const SITE_PATH = /^\/(?!\/)[A-Za-z0-9\-._~%/?=&+]*$/;

export function cleanQuery(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);
}

/** The API wants 2 to 80 characters with at least one letter or number. */
export function isSearchable(query: string): boolean {
  return query.length >= MIN_QUERY_LENGTH && /[\p{L}\p{N}]/u.test(query);
}

export function buildSuggestUrl(base: string, query: string): string {
  return buildApiUrl(base, "/search/suggest", { q: query });
}

/** Keeps only well-formed suggestions that point at our own site. */
export function safeSuggestions(payload: unknown): Suggestion[] {
  const list = (payload as { data?: unknown } | null)?.data;

  if (!Array.isArray(list)) {
    return [];
  }

  const result: Suggestion[] = [];

  for (const entry of list) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }

    const { type, label, path, tag_type } = entry as Record<string, unknown>;

    if (typeof type !== "string" || !TYPES.has(type) || typeof label !== "string" || typeof path !== "string") {
      continue;
    }

    const text = label.trim();

    if (!text || text.length > 200 || !SITE_PATH.test(path) || path.includes("..")) {
      continue;
    }

    const tagType = tag_type === "general" || tag_type === "genre" || tag_type === "studio" ? tag_type : null;

    result.push({ type: type as Suggestion["type"], label: text, path, tag_type: tagType });

    if (result.length >= MAX_SUGGESTIONS) {
      break;
    }
  }

  return result;
}