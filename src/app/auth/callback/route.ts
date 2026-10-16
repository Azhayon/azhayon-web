import { redirect } from "next/navigation";
import { apiPost } from "@/lib/api";
import { setSessionCookie, takeOAuthVerifier } from "@/lib/auth/cookies";
import type { ExchangeResponse } from "@/lib/types";

// Only these values are ever echoed back; anything else becomes "unknown".
const KNOWN_ERRORS = new Set([
  "invalid_request",
  "invalid_state",
  "access_denied",
  "oauth_failed",
  "account_disabled",
  "banned",
]);

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const error = params.get("error");

  // Always consume the verifier, whatever happens next.
  const verifier = await takeOAuthVerifier();

  if (error) {
    redirect(`/?auth_error=${KNOWN_ERRORS.has(error) ? error : "unknown"}`);
  }

  if (!code || !verifier) {
    redirect("/?auth_error=invalid_request");
  }

  let result: ExchangeResponse | null = null;

  try {
    result = await apiPost<ExchangeResponse>("/auth/exchange", { code, verifier });
  } catch {
    result = null;
  }

  if (!result) {
    redirect("/?auth_error=exchange_failed");
  }

  await setSessionCookie(result.token, new Date(result.expires_at));

  redirect("/");
}