"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { IconType } from "react-icons";
import {
    LuCode,
    LuSmartphone,
    LuLayers,
    LuBrainCircuit,
    LuSparkles,
    LuCloud,
    LuDatabase,
    LuGlobe,
    LuRocket,
    LuPalette,
    LuCpu,
    LuPenTool,
} from "react-icons/lu";

/**
 * Mock "Services" management.
 *
 * These are the marketing service cards shown on the public /freelance page.
 * There is no backend resource for them, so this store keeps full CRUD state in
 * localStorage (interactive, persists across reloads). Swapping to a real API
 * later just means replacing these actions with `api.*` calls.
 *
 * Note: we store an `iconKey` string (not a React component) because the store
 * is serialized to localStorage. Resolve it via {@link SERVICE_ICONS} at render.
 */
export interface Service {
    id: number;
    title: string;
    description: string;
    features: string[];
    price: string;
    priceLabel: string;
    iconKey: string;
    order: number;
}

/** iconKey -> lucide icon component, used when rendering services. */
export const SERVICE_ICONS: Record<string, IconType> = {
    code: LuCode,
    smartphone: LuSmartphone,
    layers: LuLayers,
    brain: LuBrainCircuit,
    sparkles: LuSparkles,
    cloud: LuCloud,
    database: LuDatabase,
    globe: LuGlobe,
    rocket: LuRocket,
    palette: LuPalette,
    cpu: LuCpu,
    pen: LuPenTool,
};

/** Options for the icon picker in the service form. */
export const SERVICE_ICON_OPTIONS: { value: string; label: string }[] = [
    { value: "code", label: "Code" },
    { value: "smartphone", label: "Mobile" },
    { value: "layers", label: "Layers" },
    { value: "brain", label: "AI / ML" },
    { value: "sparkles", label: "Sparkles" },
    { value: "cloud", label: "Cloud" },
    { value: "database", label: "Database" },
    { value: "globe", label: "Globe" },
    { value: "rocket", label: "Rocket" },
    { value: "palette", label: "Design" },
    { value: "cpu", label: "Hardware" },
    { value: "pen", label: "Writing" },
];

const SEED_SERVICES: Service[] = [
    {
        id: 1,
        title: "Web Development",
        description: "High-performance React, Next.js & Node applications engineered for scale, speed and longevity.",
        features: ["Next.js / React", "Type-safe APIs", "Core Web Vitals", "SEO-ready"],
        price: "$5,000",
        priceLabel: "Starting at",
        iconKey: "code",
        order: 0,
    },
    {
        id: 2,
        title: "Mobile Apps",
        description: "Native-feeling cross-platform apps with fluid motion and offline-first reliability.",
        features: ["React Native", "Push & sync", "App store ready", "Native modules"],
        price: "$7,500",
        priceLabel: "Starting at",
        iconKey: "smartphone",
        order: 1,
    },
    {
        id: 3,
        title: "Custom Software",
        description: "Bespoke platforms, internal tools and SaaS products built around how your business actually works.",
        features: ["SaaS platforms", "Internal tooling", "Integrations", "Scalable APIs"],
        price: "$9,000",
        priceLabel: "Starting at",
        iconKey: "layers",
        order: 2,
    },
    {
        id: 4,
        title: "AI & ML Engineering",
        description: "Production-grade AI features — RAG, agents and model pipelines wired into real products.",
        features: ["LLM & RAG apps", "AI agents", "Vector search", "MLOps pipelines"],
        price: "$8,000",
        priceLabel: "Starting at",
        iconKey: "brain",
        order: 3,
    },
    {
        id: 5,
        title: "AI Art & Generative",
        description: "Striking AI-generated visuals, brand imagery and generative art directed with a human eye.",
        features: ["Brand & hero art", "Generative systems", "Model fine-tunes", "Asset pipelines"],
        price: "$2,000",
        priceLabel: "Starting at",
        iconKey: "sparkles",
        order: 4,
    },
    {
        id: 6,
        title: "Cloud & DevOps",
        description: "Resilient cloud architecture, CI/CD and observability that keeps products always-on.",
        features: ["AWS / GCP", "CI/CD pipelines", "IaC & Docker", "Monitoring"],
        price: "$4,000",
        priceLabel: "Starting at",
        iconKey: "cloud",
        order: 5,
    },
];

interface ServicesState {
    services: Service[];
    addService: (data: Omit<Service, "id">) => void;
    updateService: (id: number, data: Omit<Service, "id">) => void;
    removeService: (id: number) => void;
    getService: (id: number) => Service | undefined;
    reset: () => void;
}

export const useServicesStore = create<ServicesState>()(
    persist(
        (set, get) => ({
            services: SEED_SERVICES,
            addService: (data) =>
                set((state) => {
                    const nextId = state.services.reduce((max, s) => Math.max(max, s.id), 0) + 1;
                    return { services: [...state.services, { ...data, id: nextId }] };
                }),
            updateService: (id, data) =>
                set((state) => ({
                    services: state.services.map((s) => (s.id === id ? { ...data, id } : s)),
                })),
            removeService: (id) =>
                set((state) => ({ services: state.services.filter((s) => s.id !== id) })),
            getService: (id) => get().services.find((s) => s.id === id),
            reset: () => set({ services: SEED_SERVICES }),
        }),
        {
            name: "portfolio-services",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Keep every open tab in sync: zustand's persist middleware does not listen for
// writes made by other tabs, so an edit in one admin tab left the others (and
// any open /freelance page) showing stale services until a reload.
if (typeof window !== "undefined") {
    window.addEventListener("storage", (event) => {
        if (event.key === "portfolio-services") {
            void useServicesStore.persist.rehydrate();
        }
    });
}
