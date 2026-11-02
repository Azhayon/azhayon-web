export type PublicUser = {
  id: number;
  name: string;
  avatar_url: string | null;
  role: "admin" | "editor" | "user";
};

/** The signed-in user from /auth/session, or null. Only the fields we expect are kept. */
export function parsePublicUser(json: unknown): PublicUser | null {
  if (typeof json !== "object" || json === null) {
    return null;
  }

  const user = (json as { user?: unknown }).user;

  if (typeof user !== "object" || user === null) {
    return null;
  }

  const { id, name, avatar_url, role } = user as Record<string, unknown>;
  const avatar = avatar_url ?? null;

  if (
    typeof id !== "number" || !Number.isInteger(id) ||
    typeof name !== "string" ||
    (avatar !== null && typeof avatar !== "string") ||
    (role !== "admin" && role !== "editor" && role !== "user")
  ) {
    return null;
  }

  return { id, name, avatar_url: avatar, role };
}

export async function loadSession(signal?: AbortSignal): Promise<PublicUser | null> {
  try {
    const response = await fetch("/auth/session", { cache: "no-store", signal });

    return response.ok ? parsePublicUser(await response.json()) : null;
  } catch {
    return null;
  }
}