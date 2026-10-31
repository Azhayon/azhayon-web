import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");

describe("cookies page", () => {
  it("lists every cookie the site sets", () => {
    const page = read("../src/app/cookies/page.tsx");
    const code = read("../src/lib/auth/cookies.ts");

    const names = [...code.matchAll(/COOKIE\s*=\s*"(azm_[a-z_]+)"/g)].map((match) => match[1]);

    expect(names.length).toBeGreaterThan(0);

    for (const name of [...names, "azm_theme"]) {
      expect(page, name).toContain(`"${name}"`);
    }
  });
});