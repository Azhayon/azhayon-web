import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/** Tiny endpoint the header calls from the browser. It exposes no token and no email. */
export async function GET() {
  const user = await getSession();

  return NextResponse.json(
    {
      user: user
        ? { id: user.id, name: user.name, avatar_url: user.avatar_url, role: user.role }
        : null,
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}