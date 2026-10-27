import "server-only";
import { parseServerEnv, type ServerEnv } from "./env-parse";

let cached: ServerEnv | undefined;

/** The validated server environment. Throws a clear, complete error if something is misconfigured. */
export function serverEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);

  return cached;
}