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
    <div className="flex h-9 w-36 items-center justify-end" aria-live="polite">
      {user === undefined ? (
        <span aria-hidden className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
      ) : user === null ? (
        <SignInButton />
      ) : (
        <details className="relative">
          <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-full bg-white/5 py-0.5 pl-0.5 pr-3 ring-1 ring-white/10 hover:ring-[#00E5FF] [&::-webkit-details-marker]:hidden">
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
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF3366] text-sm font-bold">
                {Array.from(user.name)[0]?.toUpperCase() ?? "?"}
              </span>
            )}
            <span className="max-w-20 truncate text-sm font-semibold">{user.name}</span>
          </summary>

          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl bg-[#1E1E1E] p-2 ring-1 ring-white/10">
            <p className="truncate px-3 py-2 text-sm text-[#E0E0E0]">{user.name}</p>
            <form action={handleLogout}>
              <button
                type="submit"
                className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold hover:bg-white/10"
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