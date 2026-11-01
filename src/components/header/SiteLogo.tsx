import Link from "next/link";

export function SiteLogo() {
  return (
    <Link
      href="/"
      aria-label="Azhayon Media, home"
      className="shrink-0 whitespace-nowrap font-heading text-lg font-extrabold tracking-tight"
    >
      Azhayon<span className="text-accent">Media</span>
    </Link>
  );
}