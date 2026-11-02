import "server-only";
import { describeFailure, type Failure } from "@/lib/action-result";
import { getSessionToken } from "@/lib/auth/cookies";
import { AuthError, requireUser } from "@/lib/session";

export type Authorised = { ok: true; token: string } | Failure;

/** Asks Laravel who the cookie belongs to, then hands back the token for the call that follows. Fails closed. */
export async function authorise(): Promise<Authorised> {
  try {
    await requireUser();
  } catch (error) {
    if (error instanceof AuthError) {
      return describeFailure(401);
    }

    throw error;
  }

  const token = await getSessionToken();

  return token ? { ok: true, token } : describeFailure(401);
}