import { createHmac, timingSafeEqual } from "node:crypto";
import { ALL_TAGS } from "./cache-tags";

export const MAX_BODY_BYTES = 100_000;
export const MAX_TAGS = 300;
export const MAX_CLOCK_SKEW_SECONDS = 300;

/** The same shape the API enforces: it only ever sends tags like "posts" or "post:some-slug". */
const TAG_PATTERN = /^[a-z0-9][a-z0-9:_-]{0,189}$/;

const SIGNATURE_PATTERN = /^sha256=([a-f0-9]{64})$/;

/** HMAC-SHA256 (hex) of "<timestamp>.<raw body>", exactly as the API computes it. */
export function sign(secret: string, timestamp: string, rawBody: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
}

type Verification = {
  secret: string;
  timestamp: string | null;
  signature: string | null;
  rawBody: string;
  /** Only for tests. */
  nowSeconds?: number;
};

/** True only for a fresh request whose signature matches the exact body that was received. */
export function verifySignature({ secret, timestamp, signature, rawBody, nowSeconds }: Verification): boolean {
  if (!timestamp || !/^\d{1,12}$/.test(timestamp)) {
    return false;
  }

  const now = nowSeconds ?? Math.floor(Date.now() / 1000);

  if (Math.abs(now - Number(timestamp)) > MAX_CLOCK_SKEW_SECONDS) {
    return false;
  }

  const match = SIGNATURE_PATTERN.exec(signature ?? "");

  if (!match) {
    return false;
  }

  const expected = Buffer.from(sign(secret, timestamp, rawBody), "hex");
  const given = Buffer.from(match[1], "hex");

  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type ParsedTags = { ok: true; tags: string[] } | { ok: false; reason: string };

/** Reads the request body. Anything unexpected is refused, never guessed at. */
export function parseTags(rawBody: string): ParsedTags {
  let data: unknown;

  try {
    data = JSON.parse(rawBody);
  } catch {
    return { ok: false, reason: "body is not valid JSON" };
  }

  const tags = (data as { tags?: unknown } | null)?.tags;

  if (!Array.isArray(tags) || tags.length === 0 || tags.length > MAX_TAGS) {
    return { ok: false, reason: `tags must be a list of 1 to ${MAX_TAGS} items` };
  }

  const clean = new Set<string>();

  for (const tag of tags) {
    if (typeof tag !== "string" || !TAG_PATTERN.test(tag)) {
      return { ok: false, reason: "a tag has an invalid format" };
    }

    clean.add(tag);
  }

  return { ok: true, tags: [...clean] };
}

/** "all" stands for every site-wide tag. Everything else is kept as it is. */
export function expandTags(tags: string[]): string[] {
  const expanded = new Set<string>();

  for (const tag of tags) {
    if (tag === "all") {
      ALL_TAGS.forEach((known) => expanded.add(known));
    } else {
      expanded.add(tag);
    }
  }

  return [...expanded];
}