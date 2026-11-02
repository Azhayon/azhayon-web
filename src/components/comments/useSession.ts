"use client";

import { useCallback, useEffect, useState } from "react";
import { loadSession, type PublicUser } from "@/lib/session-client";

/** undefined = still loading, null = signed out. Nothing is requested until `enabled` is true. */
export function useSession(enabled: boolean) {
  const [user, setUser] = useState<PublicUser | null | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();

    loadSession(controller.signal).then((next) => {
      if (!controller.signal.aborted) {
        setUser(next);
      }
    });

    return () => controller.abort();
  }, [enabled]);

  const refresh = useCallback(() => {
    loadSession().then(setUser);
  }, []);

  return { user, refresh };
}