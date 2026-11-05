import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { setOAuthVerifier } from "@/lib/auth/cookies";
import { setReturnPath } from "@/lib/auth/return-cookie";

const PROVIDERS = new Set(["google", "discord"]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (!PROVIDERS.has(provider)) {
    return new Response("Not found", { status: 404 });
  }

  // The verifier stays in an httpOnly cookie. Laravel only ever sees its hash.
  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256").update(verifier).digest("hex");

  await setOAuthVerifier(verifier);
  await setReturnPath(new URL(request.url).searchParams.get("next"));

  redirect(`${process.env.API_URL}/auth/${provider}/redirect?challenge=${challenge}`);
}