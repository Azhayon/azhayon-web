import "server-only";
import type { RedirectsResponse } from "@/lib/api-types";
import { buildApiUrl } from "@/lib/api/url";
import { serverEnv } from "@/lib/env";
import { buildRedirectMap, type RedirectMap } from "@/lib/redirects";

const FRESH_MS = 60_000;
const RETRY_MS = 15_000;
const TIMEOUT_MS = 2_000;
const EMPTY: RedirectMap = new Map();

let current: RedirectMap | null = null;
let freshUntil = 0;
let inflight: Promise<void> | null = null;

async function load(): Promise<void> {
  try {
    const env = serverEnv();
    const response = await fetch(buildApiUrl(env.apiUrl, "/redirects"), {
      headers: {
        Accept: "application/json",
        ...(env.frontendApiKey ? { "X-Frontend-Key": env.frontendApiKey } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`redirects: ${response.status}`);
    }

    const body = (await response.json()) as RedirectsResponse;

    current = buildRedirectMap(Array.isArray(body.data) ? body.data : [], env.siteUrl);
    freshUntil = Date.now() + FRESH_MS;
  } catch {
    // Keep whatever list we already have, and try again soon.
    freshUntil = Date.now() + RETRY_MS;
  }
}

/** The redirect list. Fresh for a minute; after that the old list is served while a new one loads. */
export async function getRedirectMap(): Promise<RedirectMap> {
  if (Date.now() < freshUntil) {
    return current ?? EMPTY;
  }

  inflight ??= load().finally(() => {
    inflight = null;
  });

  if (current) {
    return current;
  }

  await inflight;

  return current ?? EMPTY;
}