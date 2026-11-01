import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteLogo } from "@/components/header/SiteLogo";

describe("SiteLogo", () => {
  const html = renderToStaticMarkup(createElement(SiteLogo));

  it("links to the home page", () => {
    expect(html).toContain('href="/"');
  });

  it("shows the brand as its visible link text", () => {
    expect(html).toContain("Azhayon");
    expect(html).toContain("Media");
    expect(html).not.toContain("aria-label");
  });
});