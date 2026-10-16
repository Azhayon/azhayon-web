import Link from "next/link";
import { AuthMenu } from "./AuthMenu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#121212] text-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          Azhayon <span className="text-[#FF3366]">Media</span>
        </Link>
        <AuthMenu />
      </div>
    </header>
  );
}