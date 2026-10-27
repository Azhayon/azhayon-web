/**
 * The API pre-builds each image at these widths (see ImageProcessor::widthsFor in the API).
 * The stored reference is the largest variant; narrower ones exist only below it.
 */
export const VARIANT_WIDTHS = [1600, 1200, 768, 480] as const;

/** Widths that exist for an image whose largest variant is `largest`, widest first. */
export function variantWidths(largest: number): number[] {
  return [...new Set([largest, ...VARIANT_WIDTHS.filter((width) => width < largest)])].sort((a, b) => b - a);
}

const PATTERN = /^(.*\/\d{4}\/\d{2}\/[a-z0-9]{12}\/)(\d{2,5})\.webp$/;

/** next/image loader: picks the smallest pre-built variant that is at least as wide as requested. */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const match = PATTERN.exec(src);

  if (!match) {
    return src; // not one of our uploads (for example a profile picture): leave it alone
  }

  const available = variantWidths(Number(match[2]));
  const wanted = Math.ceil(width);
  const chosen = [...available].reverse().find((candidate) => candidate >= wanted) ?? available[0];

  return `${match[1]}${chosen}.webp`;
}