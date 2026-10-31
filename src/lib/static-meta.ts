import type { Metadata } from "next";
import { ogImages, twitterImages } from "@/lib/social";

/** Metadata for a fixed page: its own title, description and canonical address, with the default preview image. */
export function staticPageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", title, description, url: path, images: ogImages() },
    twitter: { card: "summary_large_image", title, description, images: twitterImages() },
  };
}