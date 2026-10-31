import { describe, expect, it } from "vitest";
import { FOOTER_LINKS } from "../src/lib/footer-links";

describe("footer links", () => {
  it("contains the required pages", () => {
    const labels = FOOTER_LINKS.map((link) => link.label);

    expect(labels).toEqual(["About", "Contact", "Privacy", "Terms", "Cookie settings"]);
  });

  it("uses unique, safe site paths", () => {
    const hrefs = FOOTER_LINKS.map((link) => link.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);

    for (const href of hrefs) {
      expect(href).toMatch(/^\/[a-z0-9-]+$/);
    }
  });
});