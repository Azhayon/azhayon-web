export const RETURN_COOKIE = "azm_return";
export const RETURN_COOKIE_MAX_AGE = 600; // seconds

const BASE = "http://return-path.invalid";
const BLOCKED_PREFIXES = ["/auth", "/api", "/preview"];
const SAFE_HASH = /^#[A-Za-z0-9_-]{1,50}$/;

/** Returns a safe same-site path (with query) or null. Never returns an absolute URL. */
export function safeReturnPath(raw: string | null | undefined): string | null {
  if (!raw || raw.length > 300) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return null;

  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return null;
  }
  if (url.origin !== BASE) return null;

  const { pathname, search } = url;
  const hash = SAFE_HASH.test(url.hash) ? url.hash : "";
  if (BLOCKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }
  return pathname + search + hash;
}

/** Where to send the visitor after the OAuth round trip. Optionally adds ?auth_error=. */
export function returnTarget(path: string | null, authError?: string): string {
  const base = path ?? "/";
  if (!authError) return base;
  const url = new URL(base, BASE);
  url.searchParams.set("auth_error", authError);
  return url.pathname + url.search + url.hash;
}

/** The login link for a provider, remembering the current page (and optionally a #section). */
export function loginHref(
  provider: "google" | "discord",
  pathname: string | null,
  hash?: string
): string {
  const base = `/auth/login/${provider}`;
  const safe = safeReturnPath(pathname);
  if (!safe) return base;
  const fragment = hash && SAFE_HASH.test(`#${hash}`) ? `#${hash}` : "";
  return `${base}?next=${encodeURIComponent(safe + fragment)}`;
}