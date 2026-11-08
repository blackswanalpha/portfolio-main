"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
    trackPageView,
    trackPageViewBeacon,
    type PageViewPayload,
} from "@/lib/api";

const SESSION_KEY = "portfolio-visit-session";

/** Stable per-tab visitor session id (sessionStorage). */
function getSessionId(): string {
    try {
        let id = window.sessionStorage.getItem(SESSION_KEY);
        if (!id) {
            id =
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
            window.sessionStorage.setItem(SESSION_KEY, id);
        }
        return id;
    } catch {
        return `s_${Date.now()}`;
    }
}

/** Admin pages are not part of public visitor analytics. */
function isTracked(path: string | null): path is string {
    return !!path && !path.startsWith("/admin");
}

/**
 * Records public page views by tracking on *leave* — when the route changes or
 * the tab is hidden/closed — so a single event carries both the view and the
 * time spent on the page. Mounted once in the root layout; self-excludes /admin.
 */
export default function PageViewTracker() {
    const pathname = usePathname();
    const currentPath = useRef<string | null>(null);
    const enteredAt = useRef<number>(0);
    const sent = useRef<boolean>(false);
    // document.referrer never changes during client-side navigation, so only the
    // landing view carries it; later in-app views would otherwise all report the
    // original external referrer and inflate referral counts.
    const referrerUsed = useRef<boolean>(false);

    const buildPayload = (path: string): PageViewPayload => {
        const referrer =
            !referrerUsed.current && typeof document !== "undefined" && document.referrer
                ? document.referrer
                : undefined;
        referrerUsed.current = true;
        return {
            page_path: path,
            session_id: getSessionId(),
            referrer,
            time_on_page: Math.max(0, Math.round((Date.now() - enteredAt.current) / 1000)),
        };
    };

    // On route change: record the page we just left, then start timing the new one.
    // `prev !== pathname` guards Strict Mode's mount→unmount→mount effect replay,
    // which otherwise logged a bogus 0-second view of the current page.
    useEffect(() => {
        const prev = currentPath.current;
        if (isTracked(prev) && prev !== pathname && !sent.current) {
            trackPageView(buildPayload(prev));
        }
        currentPath.current = pathname;
        enteredAt.current = Date.now();
        sent.current = false;
    }, [pathname]);

    // On tab hide / unload: record the final page (the route effect won't fire).
    useEffect(() => {
        const flush = () => {
            const path = currentPath.current;
            if (!isTracked(path) || sent.current) return;
            sent.current = true;
            trackPageViewBeacon(buildPayload(path));
        };
        const onVisibility = () => {
            if (document.visibilityState === "hidden") flush();
        };
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("pagehide", flush);
        return () => {
            document.removeEventListener("visibilitychange", onVisibility);
            window.removeEventListener("pagehide", flush);
        };
    }, []);

    return null;
}
