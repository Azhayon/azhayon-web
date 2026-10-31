import Link from "next/link";
import { AuthMenu } from "./AuthMenu";
import { ThemeToggle } from "./ThemeToggle";
import { getSite } from "@/lib/api/endpoints";
import { categoryLinks } from "@/lib/nav";

async function loadNavLinks() {
  try {
    const { data } = await getSite();

    return categoryLinks(data.categories);
  } catch {
    return [];
  }
}

export async function SiteHeader() {
  const links = await loadNavLinks();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas text-fg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-heading text-lg font-extrabold tracking-tight">
          {links.length > 0 && (
            <nav aria-label="Categories" className="hidden md:block">
              <ul className="flex items-center gap-1 text-sm">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="rounded px-3 py-2 text-muted hover:text-fg">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}