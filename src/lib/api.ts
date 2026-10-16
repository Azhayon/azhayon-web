import "server-only";

const API_URL = process.env.API_URL;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiGet<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("API_URL is not set");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  init: RequestInit = {}
): Promise<T> {
  if (!API_URL) {
    throw new Error("API_URL is not set");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new ApiError(res.status, `API request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}