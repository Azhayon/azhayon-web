import Link from "next/link";
import { AuthMenu } from "./AuthMenu";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas text-fg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-heading text-lg font-extrabold tracking-tight">
          Azhayon <span className="text-accent">Media</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}