import { NextResponse } from "next/server";
import { failureFromError } from "@/lib/action-result";
import { getMyRating } from "@/lib/api/endpoints";
import { authorise } from "@/lib/engagement-server";
import { isSlug } from "@/lib/slug";

const HEADERS = { "Cache-Control": "private, no-store" };

/** The signed-in visitor's own rating of a post, or null when signed out. It exposes no token. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!isSlug(slug)) {
    return NextResponse.json({ rating: null }, { status: 404, headers: HEADERS });
  }

  const auth = await authorise();

  if (!auth.ok) {
    return NextResponse.json({ rating: null }, { headers: HEADERS });
  }

  try {
    const { data } = await getMyRating(auth.token, slug);

    return NextResponse.json({ rating: data }, { headers: HEADERS });
  } catch (error) {
    const status = failureFromError(error).code === "missing" ? 404 : 200;

    return NextResponse.json({ rating: null }, { status, headers: HEADERS });
  }
}