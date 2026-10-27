export type QueryValue = string | number | boolean | null | undefined;

/** Builds an API address with a canonical query string: keys sorted, empty values dropped. */
export function buildApiUrl(base: string, path: string, params: Record<string, QueryValue> = {}): string {
  if (!path.startsWith("/") || path.startsWith("//") || /[?#\\]/.test(path) || path.split("/").includes("..")) {
    throw new Error(`Invalid API path: ${path}`);
  }

  const query = new URLSearchParams();

  for (const key of Object.keys(params).sort()) {
    const value = params[key];

    if (value === undefined || value === null || value === "") {
      continue;
    }

    query.set(key, String(value));
  }

  const queryString = query.toString();

  return `${base.replace(/\/+$/, "")}${path}${queryString ? `?${queryString}` : ""}`;
}