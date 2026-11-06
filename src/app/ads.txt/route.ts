import { getSite } from "@/lib/api/endpoints";
import { adsTxt } from "@/lib/ads";

const TEXT = "text/plain; charset=utf-8";

export async function GET() {
  let site;

  try {
    site = await getSite();
  } catch {
    // The API is unreachable: say so, and never let a crawler cache it.
    return new Response("Temporarily unavailable.", {
      status: 503,
      headers: { "Content-Type": TEXT, "Cache-Control": "no-store" },
    });
  }

  const body = adsTxt(site.data.ads);

  if (body === null) {
    return new Response("Not found.", {
      status: 404,
      headers: { "Content-Type": TEXT, "Cache-Control": "public, max-age=300" },
    });
  }

  return new Response(body, {
    headers: { "Content-Type": TEXT, "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}