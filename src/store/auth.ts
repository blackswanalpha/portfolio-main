"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

export interface AuthUser {
  id?: number;
  username: string;
  email?: string;
  full_name?: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user?: AuthUser | null, remember?: boolean) => void;
  /** Update the cached user without touching the token or "remember" bucket. */
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const STORE_KEY = "portfolio-auth";
const REMEMBER_KEY = "portfolio-remember";

/**
 * "Remember this device" storage.
 *
 * When the admin checks the box we persist the session in `localStorage` so it
 * survives a browser restart. When unchecked we keep it in `sessionStorage`, so
 * the token is dropped once the browser/tab session ends. The chosen bucket is
 * remembered via a small flag in `localStorage` (`portfolio-remember`) which is
 * also read on hydration so reloads restore from wherever the session was saved.
 */
function shouldRemember(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(REMEMBER_KEY) !== "false";
}

const rememberAwareStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const store = shouldRemember() ? window.localStorage : window.sessionStorage;
    return store.getItem(name);
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    const remember = shouldRemember();
    const target = remember ? window.localStorage : window.sessionStorage;
    const other = remember ? window.sessionStorage : window.localStorage;
    other.removeItem(name); // avoid a stale copy in the other bucket
    target.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
    window.sessionStorage.removeItem(name);
  },
};

/**
 * Persisted auth store. The JWT is kept in web storage so the admin session
 * survives reloads. `src/lib/api.ts` reads the token via `useAuthStore.getState()`
 * to attach the Authorization header on protected requests.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user = null, remember = true) => {
        // Record the remember choice BEFORE persisting so the write lands in the
        // correct bucket (localStorage vs sessionStorage).
        if (typeof window !== "undefined") {
          window.localStorage.setItem(REMEMBER_KEY, String(remember));
        }
        set({ token, user });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(REMEMBER_KEY);
          window.sessionStorage.removeItem(STORE_KEY);
        }
        set({ token: null, user: null });
      },
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => rememberAwareStorage),
    }
  )
);
