import { cookies } from "next/headers";
import { RETURN_COOKIE, RETURN_COOKIE_MAX_AGE, safeReturnPath } from "@/lib/return-path";

const COOKIE_PATH = "/auth"; // covers /auth/login/* and /auth/callback only

export async function setReturnPath(raw: string | null): Promise<void> {
  const store = await cookies();
  const path = safeReturnPath(raw);

  if (!path) {
    // Clear any stale value from an earlier, abandoned attempt.
    store.set(RETURN_COOKIE, "", { path: COOKIE_PATH, maxAge: 0 });
    return;
  }

  store.set(RETURN_COOKIE, path, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: RETURN_COOKIE_MAX_AGE,
  });
}

/** Reads, clears and re-validates the stored path. Always call it, whatever happens next. */
export async function takeReturnPath(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(RETURN_COOKIE)?.value ?? null;
  store.set(RETURN_COOKIE, "", { path: COOKIE_PATH, maxAge: 0 });
  return safeReturnPath(value);
}