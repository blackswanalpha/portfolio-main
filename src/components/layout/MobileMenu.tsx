"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { LuGamepad2, LuX } from "react-icons/lu";
import { usePublicSettings } from "@/hooks/usePublicSettings";
import { useScrollLock } from "@/lib/scrollLock";

interface MobileMenuProps {
    isOpen: boolean;
    /** Close and hand focus back to the menu button. */
    onClose: () => void;
    id?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const linkClass =
    "-mx-3 flex items-center gap-2 rounded-lg px-3 py-2 text-lg font-medium text-slate-800 transition-colors hover:bg-slate-100 hover:text-primary active:bg-slate-200";

/**
 * Modal side panel for small screens. Escape, the scrim and the close button
 * close it; Tab stays inside while it is open. The body scroll lock is the
 * shared, reference-counted one and is released whenever the menu closes or
 * unmounts (a route change unmounts it with the page).
 */
const MobileMenu = ({ isOpen, onClose, id }: MobileMenuProps) => {
    const settings = usePublicSettings();
    useScrollLock(isOpen);

    const panelRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    // Latest onClose without re-running the key handler effect on re-renders.
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        closeButtonRef.current?.focus();
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onCloseRef.current();
                return;
            }
            if (e.key !== "Tab" || !panelRef.current) return;
            const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
            if (items.length === 0) return;
            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;
            if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Scrim */}
            <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-hidden="true" />

            {/* Menu panel */}
            <div
                ref={panelRef}
                id={id}
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className="mobile-menu-panel absolute top-0 right-0 flex h-full w-[280px] max-w-[85vw] flex-col border-l border-black/[0.08] bg-white p-6 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.25)]"
            >
                <div className="mb-8 flex justify-end">
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        aria-label="Close menu"
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
                    >
                        <LuX size={20} aria-hidden="true" />
                    </button>
                </div>

                {settings.available_for_work && (
                    <div className="mb-6 inline-flex items-center gap-1.5 self-start rounded-md bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden="true" />
                        Open to work
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <Link href="/" className={linkClass} onClick={onClose}>Home</Link>
                    <Link href="/experience" className={linkClass} onClick={onClose}>Experience</Link>
                    <Link href="/projects" className={linkClass} onClick={onClose}>Projects</Link>
                    <Link href="/gallery" className={linkClass} onClick={onClose}>Gallery</Link>
                    <Link href="/blog" className={linkClass} onClick={onClose}>Blog</Link>
                    <Link href="/testimonials" className={linkClass} onClick={onClose}>Testimonials</Link>
                </div>

                <div className="mt-auto border-t border-black/[0.08] pt-6">
                    <Link
                        href="/puzzle-game"
                        className="-mx-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary active:bg-slate-200"
                        onClick={onClose}
                    >
                        <LuGamepad2 size={16} aria-hidden="true" />
                        Arcade
                    </Link>
                </div>
            </div>
            <style jsx>{`
                @keyframes mobileMenuIn {
                    from {
                        transform: translateX(16px);
                        opacity: 0;
                    }
                    to {
                        transform: none;
                        opacity: 1;
                    }
                }
                .mobile-menu-panel {
                    animation: mobileMenuIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @media (prefers-reduced-motion: reduce) {
                    .mobile-menu-panel {
                        animation: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default MobileMenu;
