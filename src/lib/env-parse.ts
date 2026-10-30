export type ServerEnv = {
  appEnv: "local" | "production";
  apiUrl: string;
  siteUrl: string;
  allowIndexing: boolean;
  frontendApiKey: string | null;
  revalidateSecret: string | null;
};

type Raw = Record<string, string | undefined>;

export class EnvError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Invalid environment:\n- ${problems.join("\n- ")}`);
    this.name = "EnvError";
  }
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function parseUrl(name: string, value: string, problems: string[], production: boolean): URL | null {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    problems.push(`${name} must be a full URL, for example https://example.com`);

    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    problems.push(`${name} must start with http:// or https://`);

    return null;
  }

  if (production && url.protocol !== "https:") {
    problems.push(`${name} must use https:// in production`);
  }

  if (url.username || url.password) {
    problems.push(`${name} must not contain a username or password`);
  }

  return url;
}

/** Validates the server environment. Throws one error that lists every problem at once. */
export function parseServerEnv(raw: Raw): ServerEnv {
  const problems: string[] = [];

  const appEnv = clean(raw.APP_ENV) ?? "local";

  if (appEnv !== "local" && appEnv !== "production") {
    problems.push('APP_ENV must be "local" or "production"');
  }

  const production = appEnv === "production";

  let apiUrl = "";
  const apiRaw = clean(raw.API_URL);

  if (!apiRaw) {
    problems.push("API_URL is required (for example http://127.0.0.1:8000/api/v1)");
  } else {
    const url = parseUrl("API_URL", apiRaw, problems, production);

    if (url) {
      apiUrl = `${url.origin}${url.pathname}`.replace(/\/+$/, "");
    }
  }

  let siteUrl = "http://localhost:3000";
  const siteRaw = clean(raw.SITE_URL);

  if (!siteRaw) {
    if (production) {
      problems.push("SITE_URL is required in production (for example https://azhayonmedia.com)");
    }
  } else {
    const url = parseUrl("SITE_URL", siteRaw, problems, production);

    if (url) {
      if (url.pathname !== "/" || url.search || url.hash) {
        problems.push("SITE_URL must be just the address, with no path (for example https://azhayonmedia.com)");
      } else {
        siteUrl = url.origin;
      }
    }
  }

  const indexing = (clean(raw.ALLOW_INDEXING) ?? "false").toLowerCase();

  if (indexing !== "true" && indexing !== "false") {
    problems.push('ALLOW_INDEXING must be "true" or "false"');
  }

  const secret = (name: string, requiredInProduction: boolean): string | null => {
    const value = clean(raw[name]);

    if (!value) {
      if (production && requiredInProduction) {
        problems.push(`${name} is required in production`);
      }

      return null;
    }

    if (value.length < 32) {
      problems.push(`${name} must be at least 32 characters`);
    }

    return value;
  };

  const frontendApiKey = secret("FRONTEND_API_KEY", true);
  const revalidateSecret = secret("REVALIDATE_SECRET", true);

  if (problems.length > 0) {
    throw new EnvError(problems);
  }

  return {
    appEnv: production ? "production" : "local",
    apiUrl,
    siteUrl,
    allowIndexing: indexing === "true",
    frontendApiKey,
    revalidateSecret,
  };
}