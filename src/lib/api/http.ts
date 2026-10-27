import "server-only";
import { isIP } from "node:net";
import { headers } from "next/headers";
import { serverEnv } from "@/lib/env";
import { buildApiUrl, type QueryValue } from "./url";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Options = {
  method?: "GET" | "POST";
  params?: Record<string, QueryValue>;
  body?: unknown;
  /** A signed-in user's API token. */
  token?: string;
  /** Cache tags, so the API can refresh this data when content changes. */
  tags?: string[];
  /** Fallback lifetime in seconds if a refresh notification is ever missed. */
  revalidate?: number;
  /** Never cache (search, previews, anything personal). */
  noStore?: boolean;
  /**
   * Send the visitor's IP so rate limits count them, not our server. Only for dynamic requests:
   * reading request headers opts a page out of static caching.
   */
  forwardVisitor?: boolean;
  timeoutMs?: number;
};

/** The visitor's address. Behind Cloudflare, cf-connecting-ip is the trustworthy one. */
export async function visitorIp(): Promise<string | undefined> {
  const incoming = await headers();
  const candidates = [incoming.get("cf-connecting-ip"), incoming.get("x-real-ip"), incoming.get("x-forwarded-for")?.split(",")[0]];

  for (const candidate of candidates) {
    const ip = candidate?.trim();

    if (ip && isIP(ip) !== 0) {
      return ip;
    }
  }

  return undefined;
}

export async function request<T>(path: string, options: Options = {}): Promise<T> {
  const env = serverEnv();
  const url = buildApiUrl(env.apiUrl, path, options.params);

  const requestHeaders: Record<string, string> = { Accept: "application/json" };

  if (env.frontendApiKey) {
    requestHeaders["X-Frontend-Key"] = env.frontendApiKey;

    if (options.forwardVisitor) {
      const ip = await visitorIp();

      if (ip) {
        requestHeaders["X-Client-IP"] = ip;
      }
    }
  }

  if (options.token) {
    requestHeaders.Authorization = `Bearer ${options.token}`;
  }

  if (options.body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers: requestHeaders,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
      ...(options.noStore
        ? { cache: "no-store" as const }
        : { next: { tags: options.tags, revalidate: options.revalidate ?? 3600 } }),
    });
  } catch {
    throw new ApiError(503, "The API could not be reached.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    // not JSON: handled below
  }

  if (!response.ok) {
    const body = (payload ?? {}) as { message?: string; errors?: Record<string, string[]> };

    throw new ApiError(response.status, body.message ?? `API request failed: ${response.status}`, body.errors);
  }

  return payload as T;
}