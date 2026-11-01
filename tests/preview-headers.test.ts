import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

async function rules() {
  return (await nextConfig.headers?.()) ?? [];
}

async function previewHeaders(): Promise<Record<string, string>> {
  const rule = (await rules()).find((r) => r.source === "/preview/:path*");

  return Object.fromEntries((rule?.headers ?? []).map((h) => [h.key, h.value]));
}

describe("preview headers", () => {
  it("never leaks the link, never gets indexed, never gets cached", async () => {
    const headers = await previewHeaders();

    expect(headers["Referrer-Policy"]).toBe("no-referrer");
    expect(headers["X-Robots-Tag"]).toBe("noindex, nofollow");
    expect(headers["Cache-Control"]).toBe("private, no-store");
  });

  it("is listed after the global rule so its Referrer-Policy wins", async () => {
    const all = await rules();
    const global = all.findIndex((r) => r.source === "/:path*");
    const preview = all.findIndex((r) => r.source === "/preview/:path*");

    expect(global).toBeGreaterThanOrEqual(0);
    expect(preview).toBeGreaterThan(global);
  });

  it("keeps the global security headers", async () => {
    const global = (await rules()).find((r) => r.source === "/:path*");
    const keys = (global?.headers ?? []).map((h) => h.key);

    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("X-Frame-Options");
  });
});