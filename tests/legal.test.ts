import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { FOOTER_LINKS } from "../src/lib/footer-links";
import { OPERATOR } from "../src/lib/legal";

describe("information pages", () => {
  it("every footer link points to a page that exists", () => {
    for (const link of FOOTER_LINKS) {
      const file = fileURLToPath(new URL(`../src/app${link.href}/page.tsx`, import.meta.url));

      expect(existsSync(file), link.href).toBe(true);
    }
  });

  it("has an owner name and a plausible contact address", () => {
    expect(OPERATOR.owner.trim().length).toBeGreaterThan(2);
    expect(OPERATOR.contactEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("has a valid last-updated date", () => {
    expect(Number.isNaN(new Date(OPERATOR.lastUpdated).getTime())).toBe(false);
  });
});