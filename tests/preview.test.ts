import { describe, expect, it } from "vitest";
import { parsePreviewLink } from "@/lib/preview";

const ok = { expires: "1790000000", signature: "a".repeat(64) };

describe("parsePreviewLink", () => {
  it("accepts a well-formed link", () => {
    expect(parsePreviewLink("42", ok)).toEqual({ id: "42", ...ok });
  });

  it("rejects ids that are not positive integers", () => {
    for (const id of ["0", "-1", "4a", "../x", "042", ""]) {
      expect(parsePreviewLink(id, ok)).toBeNull();
    }
  });

  it("rejects missing values", () => {
    expect(parsePreviewLink("42", { expires: ok.expires })).toBeNull();
    expect(parsePreviewLink("42", { signature: ok.signature })).toBeNull();
  });

  it("rejects repeated parameters", () => {
    expect(parsePreviewLink("42", { ...ok, signature: [ok.signature, ok.signature] })).toBeNull();
  });

  it("rejects a non-numeric expiry", () => {
    expect(parsePreviewLink("42", { ...ok, expires: "soon" })).toBeNull();
  });

  it("rejects a signature with odd characters or the wrong size", () => {
    expect(parsePreviewLink("42", { ...ok, signature: "abc" })).toBeNull();
    expect(parsePreviewLink("42", { ...ok, signature: "a".repeat(63) + "&" })).toBeNull();
  });
});