import { NextResponse, type NextRequest } from "next/server";
import { getRedirectMap } from "@/lib/redirect-store";
import { resolveRedirect, shouldSkipPath } from "@/lib/redirects";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipPath(pathname)) {
    return NextResponse.next();
  }

  const target = resolveRedirect(await getRedirectMap(), pathname);

  if (!target) {
    return NextResponse.next();
  }

  const [path, query] = target.to.split("?");
  const url = request.nextUrl.clone();

  url.pathname = path;
  url.search = query ? `?${query}` : "";

  return NextResponse.redirect(url, target.status);
}

// A cheap first filter. shouldSkipPath is the real rule.
export const config = { matcher: ["/((?!_next/|api/|auth/|.*\\..*).*)"] };