import type { Metadata } from "next";

/** Metadata for a fixed page: its own title, description and canonical address. */
export function staticPageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", title, description, url: path },
  };
}