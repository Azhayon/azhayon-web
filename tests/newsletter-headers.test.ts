import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import { ROBOTS_DISALLOW } from "@/lib/seo";

async function rules() {
  return (await nextConfig.headers?.()) ?? [];
}

describe("newsletter pages", () => {
  it("never leak the token, never get indexed, never get cached", async () => {
    const rule = (await rules()).find((r) => r.source === "/newsletter/:path*");
    const headers = Object.fromEntries((rule?.headers ?? []).map((h) => [h.key, h.value]));

    expect(headers["Referrer-Policy"]).toBe("no-referrer");
    expect(headers["X-Robots-Tag"]).toBe("noindex, nofollow");
    expect(headers["Cache-Control"]).toBe("private, no-store");
  });

  it("are listed after the global rule and are disallowed in robots.txt", async () => {
    const all = await rules();
    const global = all.findIndex((r) => r.source === "/:path*");
    const newsletter = all.findIndex((r) => r.source === "/newsletter/:path*");

    expect(global).toBeGreaterThanOrEqual(0);
    expect(newsletter).toBeGreaterThan(global);
    expect(ROBOTS_DISALLOW).toContain("/newsletter/");
  });
});