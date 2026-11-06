import { describe, expect, it } from "vitest";
import type { AdsOn } from "../src/lib/api-types";
import { adsTxt } from "../src/lib/ads";

const on: AdsOn = {
  enabled: true,
  client: "ca-pub-1234567890123456",
  placements: {
    sidebar: { enabled: false, slot: null },
    in_article: { enabled: true, slot: "1234567890" },
    anchor: { enabled: false, slot: null },
  },
  rules: { in_article_every: 4, in_article_max: 3 },
};

describe("adsTxt", () => {
  it("writes one Google line without the ca- prefix", () => {
    expect(adsTxt(on)).toBe("google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n");
  });

  it("is null when ads are off or missing", () => {
    expect(adsTxt({ enabled: false })).toBeNull();
    expect(adsTxt(undefined)).toBeNull();
  });

  it("is null for anything that is not a real publisher ID", () => {
    for (const client of ["", "pub-1234567890123456", "ca-pub-123", "ca-pub-1234567890123456\nevil.com, 1, DIRECT"]) {
      expect(adsTxt({ ...on, client })).toBeNull();
    }
  });
});