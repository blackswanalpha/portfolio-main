"use client";

import Link from "next/link";
import { useEffect } from "react";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] md:hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div className="absolute top-0 right-0 h-full w-[280px] bg-white dark:bg-[#13191f] shadow-2xl p-6 flex flex-col transition-transform duration-300 animate-slide-in-right">
                <div className="flex justify-end mb-8">
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:text-primary transition-colors"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    <Link href="/" className="text-lg font-medium text-slate-800 dark:text-gray-200 hover:text-primary transition-colors" onClick={onClose}>Home</Link>
                    <Link href="/experience" className="text-lg font-medium text-slate-800 dark:text-gray-200 hover:text-primary transition-colors" onClick={onClose}>Experience</Link>
                    <Link href="/projects" className="text-lg font-medium text-slate-800 dark:text-gray-200 hover:text-primary transition-colors" onClick={onClose}>Projects</Link>
                    <Link href="#freelance" className="text-lg font-medium text-slate-800 dark:text-gray-200 hover:text-primary transition-colors" onClick={onClose}>Freelance</Link>
                    <Link href="/testimonials" className="text-lg font-medium text-slate-800 dark:text-gray-200 hover:text-primary transition-colors" onClick={onClose}>Testimonials</Link>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-200 dark:border-slate-800">
                    <Link href="/admin/login" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors" onClick={onClose}>
                        <span className="material-icons">settings</span>
                        <span>Admin Login</span>
                    </Link>
                </div>
            </div>
            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MobileMenu;
