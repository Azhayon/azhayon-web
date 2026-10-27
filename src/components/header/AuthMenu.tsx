"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/auth/actions";
import { SignInButton } from "./SignInButton";

type PublicUser = {
  id: number;
  name: string;
  avatar_url: string | null;
  role: "admin" | "editor" | "user";
};

export function AuthMenu() {
  const router = useRouter();
  // undefined = still loading, null = signed out
  const [user, setUser] = useState<PublicUser | null | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/auth/session", { cache: "no-store", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data: { user: PublicUser | null }) => setUser(data.user))
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setUser(null);
        }
      });

    return () => controller.abort();
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
    router.refresh();
  }

  return (
    // Fixed size: skeleton, button and avatar menu all fit the same box (no CLS).
    <div className="flex h-9 w-24 items-center justify-end sm:w-36" aria-live="polite">
      {user === undefined ? (
        <span aria-hidden className="h-8 w-24 animate-pulse rounded-full bg-raised" />
      ) : user === null ? (
        <SignInButton />
      ) : (
        <details className="relative">
          <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-full bg-raised py-0.5 pl-0.5 pr-3 ring-1 ring-line hover:ring-cyan [&::-webkit-details-marker]:hidden">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt=""
                width={32}
                height={32}
                unoptimized
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent">
                {Array.from(user.name)[0]?.toUpperCase() ?? "?"}
              </span>
            )}
            <span className="hidden max-w-20 truncate text-sm font-semibold sm:inline">{user.name}</span>
          </summary>

          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl bg-surface p-2 ring-1 ring-line">
            <p className="truncate px-3 py-2 text-sm text-muted">{user.name}</p>
            <form action={handleLogout}>
              <button
                type="submit"
                className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold hover:bg-raised-hover"
              >
                Sign out
              </button>
            </form>
          </div>
        </details>
      )}
    </div>
  );
}