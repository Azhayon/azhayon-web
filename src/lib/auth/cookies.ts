import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "azm_session";
export const OAUTH_COOKIE = "azm_oauth";

const isProd = process.env.NODE_ENV === "production";

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** The login verifier. It lives only for the OAuth round trip. */
export async function setOAuthVerifier(verifier: string) {
  const store = await cookies();
  store.set(OAUTH_COOKIE, verifier, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax", // must be lax: it is sent when the provider flow returns to us
    path: "/auth",
    maxAge: 600,
  });
}

/** Reads the verifier and deletes it, so it can only be used once. */
export async function takeOAuthVerifier(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(OAUTH_COOKIE)?.value ?? null;
  store.delete(OAUTH_COOKIE);
  return value;
}