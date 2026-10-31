import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("system pages", () => {
  it("has a 404 page, an error boundary and a root error page", () => {
    for (const name of ["not-found.tsx", "error.tsx", "global-error.tsx"]) {
      const file = fileURLToPath(new URL(`../src/app/${name}`, import.meta.url));

      expect(existsSync(file), name).toBe(true);
    }
  });
});