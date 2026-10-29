import { revalidateTag } from "next/cache";
import { serverEnv } from "@/lib/env";
import { expandTags, MAX_BODY_BYTES, parseTags, verifySignature } from "@/lib/revalidation";

/**
 * How cached data expires. { expire: 0 } expires it immediately, so the next visitor
 * gets fresh content instead of a stale copy. ("max" would serve the stale copy once
 * while a new one is built in the background.)
 */
const PROFILE = { expire: 0 } as const;

function reply(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

/** Reads the body, but gives up (returns null) as soon as it grows past the limit. */
async function readLimited(request: Request, limit: number): Promise<string | null> {
  const reader = request.body?.getReader();

  if (!reader) {
    return "";
  }

  const chunks: Uint8Array[] = [];
  let size = 0;

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    size += value.byteLength;

    if (size > limit) {
      await reader.cancel();

      return null;
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks).toString("utf8");
}

/** Called by the API (once a minute at most) to say which cached pages are out of date. */
export async function POST(request: Request): Promise<Response> {
  const secret = serverEnv().revalidateSecret;

  if (!secret) {
    return reply(503, { error: "not configured" }); // fails closed: nothing can be refreshed without the secret
  }

  const rawBody = await readLimited(request, MAX_BODY_BYTES);

  if (rawBody === null) {
    return reply(413, { error: "too large" });
  }

  const authentic = verifySignature({
    secret,
    timestamp: request.headers.get("x-revalidate-timestamp"),
    signature: request.headers.get("x-revalidate-signature"),
    rawBody,
  });

  if (!authentic) {
    return reply(401, { error: "unauthorized" });
  }

  const parsed = parseTags(rawBody);

  if (!parsed.ok) {
    return reply(422, { error: parsed.reason });
  }

  const tags = expandTags(parsed.tags);

  for (const tag of tags) {
    revalidateTag(tag, PROFILE);
  }

  return reply(200, { revalidated: true, tags });
}