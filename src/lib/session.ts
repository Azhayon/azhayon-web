import "server-only";
import { cache } from "react";
import { ApiError, apiGet } from "@/lib/api";
import { getSessionToken } from "@/lib/auth/cookies";
import type { SessionUser } from "@/lib/types";

/**
 * Resolves the signed-in user from the session cookie by asking Laravel.
 * Fails closed: any problem means "not signed in".
 *
 * Reading cookies makes a route dynamic. Never call this from cacheable
 * public pages; use it in Server Actions, route handlers and private pages.
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  try {
    const res = await apiGet<{ data: SessionUser }>("/me", {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (e) {
    if (!(e instanceof ApiError && (e.status === 401 || e.status === 403))) {
      console.error("getSession failed", e);
    }

    return null;
  }
});

export class AuthError extends Error {
  constructor(message = "Unauthenticated") {
    super(message);
    this.name = "AuthError";
  }
}

/** Call at the top of every Server Action that needs a signed-in user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();

  if (!user) {
    throw new AuthError();
  }

  return user;
}