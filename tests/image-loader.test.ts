import { describe, expect, it } from "vitest";
import imageLoader, { variantWidths } from "../src/lib/image-loader";

const dir = "https://api.example.test/uploads/2026/10/abcdefghijkl";

describe("variantWidths (must match the API's rule)", () => {
  it("lists the widths that exist for each largest size", () => {
    expect(variantWidths(1600)).toEqual([1600, 1200, 768, 480]);
    expect(variantWidths(1500)).toEqual([1500, 1200, 768, 480]);
    expect(variantWidths(1000)).toEqual([1000, 768, 480]);
    expect(variantWidths(481)).toEqual([481, 480]);
    expect(variantWidths(480)).toEqual([480]);
    expect(variantWidths(400)).toEqual([400]);
  });
});

describe("imageLoader", () => {
  const load = (largest: number, width: number) => imageLoader({ src: `${dir}/${largest}.webp`, width });

  it("picks the smallest variant that is wide enough", () => {
    expect(load(1600, 100)).toBe(`${dir}/480.webp`);
    expect(load(1600, 480)).toBe(`${dir}/480.webp`);
    expect(load(1600, 481)).toBe(`${dir}/768.webp`);
    expect(load(1600, 769)).toBe(`${dir}/1200.webp`);
    expect(load(1600, 1201)).toBe(`${dir}/1600.webp`);
  });

  it("never asks for a size that does not exist", () => {
    expect(load(1600, 3840)).toBe(`${dir}/1600.webp`);
    expect(load(1000, 300)).toBe(`${dir}/480.webp`);
    expect(load(1000, 600)).toBe(`${dir}/768.webp`);
    expect(load(1000, 900)).toBe(`${dir}/1000.webp`);
    expect(load(1000, 2000)).toBe(`${dir}/1000.webp`);
    expect(load(400, 1920)).toBe(`${dir}/400.webp`);
  });

  it("rounds fractional widths up", () => {
    expect(load(1600, 480.4)).toBe(`${dir}/768.webp`);
  });

  it("leaves anything that is not one of our uploads alone", () => {
    for (const src of [
      "https://lh3.googleusercontent.com/a/some-picture",
      "data:image/png;base64,AAAA",
      "/uploads/2026/10/short/1600.webp",
      `${dir}/1600.jpg`,
    ]) {
      expect(imageLoader({ src, width: 640 })).toBe(src);
    }
  });

  it("works with relative upload paths too", () => {
    expect(imageLoader({ src: "/uploads/2026/10/abcdefghijkl/1600.webp", width: 700 })).toBe("/uploads/2026/10/abcdefghijkl/768.webp");
  });
});