import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthNotice } from "@/components/header/AuthNotice";
import { SiteHeader } from "@/components/header/SiteHeader";
import { serverEnv } from "@/lib/env";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { themeScript } from "@/lib/theme";

const heading = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// No site-wide canonical here on purpose: it would point every page at the home page.
// Each page sets its own canonical address.
export function generateMetadata(): Metadata {
  const env = serverEnv();

  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    robots: env.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: "#121212",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${heading.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-canvas text-fg antialiased">
        <SiteHeader />
        <AuthNotice />
        {children}
      </body>
    </html>
  );
}