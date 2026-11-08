"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

interface TestimonialBadgeState {
  /** Number of testimonials awaiting review (drives the sidebar badge). */
  pendingCount: number;
  /** Re-fetch the pending count from the backend. Best-effort: errors are swallowed. */
  refresh: () => Promise<void>;
}

export const useTestimonialBadge = create<TestimonialBadgeState>((set) => ({
  pendingCount: 0,
  refresh: async () => {
    try {
      const res = await api.get<{ count: number }>("/testimonials/admin/pending-count");
      set({ pendingCount: res.count ?? 0 });
    } catch {
      // Not authenticated yet, or the request failed — the badge is non-critical.
    }
  },
}));
