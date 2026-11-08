"use client";

import { useEffect, useState } from "react";
import { api, type SiteSettings } from "@/lib/api";

const DEFAULTS: SiteSettings = {
  professional_title: null,
  meta_title: null,
  meta_description: null,
  show_freelance: true,
  available_for_work: false,
  updated_at: null,
};

// Module-level cache so the public settings are fetched once and shared across
// every component that reads them (Navbar, MobileMenu, ...). It is NOT
// permanent: it is dropped when the admin saves settings
// (invalidatePublicSettings) and refreshed when the tab regains focus, so a
// change never stays stale until a full reload.
let cached: SiteSettings | null = null;
let inflight: Promise<SiteSettings> | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

function publish(s: SiteSettings) {
  cached = s;
  listeners.forEach((l) => l(s));
}

function fetchSettings(force = false): Promise<SiteSettings> {
  if (cached && !force) return Promise.resolve(cached);
  if (!inflight) {
    inflight = api
      .get<SiteSettings>("/settings/")
      .then((s) => {
        publish(s);
        return s;
      })
      // Keep the last good value on failure; fall back to defaults only if we
      // never had one.
      .catch(() => cached ?? DEFAULTS)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * Drop the cached settings and re-fetch them for every mounted reader. Call it
 * after saving settings in the admin so the public chrome updates immediately.
 */
export function invalidatePublicSettings(): Promise<SiteSettings> {
  return fetchSettings(true);
}

/**
 * Read the public site settings (SEO meta + visibility toggles). Returns sane
 * defaults until the fetch resolves and never throws, so it's safe to call from
 * always-rendered chrome like the navbar.
 */
export function usePublicSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(cached ?? DEFAULTS);

  useEffect(() => {
    let active = true;
    const onChange = (s: SiteSettings) => {
      if (active) setSettings(s);
    };
    listeners.add(onChange);
    fetchSettings().then(onChange);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchSettings(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      listeners.delete(onChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return settings;
}
