"use server";

import { redirect } from "next/navigation";
import { apiPost } from "@/lib/api";
import { clearSessionCookie, getSessionToken } from "@/lib/auth/cookies";

export async function logout() {
  const token = await getSessionToken();

  if (token) {
    try {
      await apiPost("/auth/logout", {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      // Even if Laravel can't be reached, still clear the cookie locally.
    }
  }

  await clearSessionCookie();
  redirect("/");
}