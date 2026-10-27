import "server-only";
import { ApiError, request } from "./api/http";

export { ApiError };

/** Server-to-server calls for sign-in and the session. Always dynamic, never cached. */
export function apiGet<T>(path: string, options: { token?: string } = {}): Promise<T> {
  return request<T>(path, { noStore: true, forwardVisitor: true, token: options.token });
}

export function apiPost<T>(path: string, body: unknown, options: { token?: string } = {}): Promise<T> {
  return request<T>(path, { method: "POST", body, noStore: true, forwardVisitor: true, token: options.token });
}