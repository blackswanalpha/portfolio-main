"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

const emptySubscribe = () => () => {};

/**
 * Client-side guard for admin pages. Redirects to /admin/login when no token is
 * present. `checked` is false during SSR/first paint and true once running on
 * the client (so SSR/first paint can show a loader instead of flashing
 * protected content or redirecting before the persisted store has hydrated).
 */
export function useRequireAuth() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const checked = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Only decide once `checked` is true. During the hydration render zustand
  // serves `getInitialState()` (persisted session NOT applied, so token is null)
  // as the server snapshot; redirecting on that value bounced every hard reload
  // of an admin page to /admin/login even with a valid stored session.
  useEffect(() => {
    if (checked && !token) {
      router.replace("/admin/login");
    }
  }, [checked, token, router]);

  return { authed: !!token, checked };
}
