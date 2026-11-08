import type { Project, ProjectCategory } from "@/lib/api";

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
    web_app: "Web app",
    mobile_app: "Mobile app",
    desktop_app: "Desktop app",
    api: "API",
    library: "Library",
    tool: "Tool",
    other: "Other",
};

// ---------------------------------------------------------------------------
// Calendar dates
//
// The API sends dates as "YYYY-MM-DD" and timestamps as "YYYY-MM-DDTHH:MM:SS".
// `new Date("2024-01-01")` is UTC midnight, which renders as Dec 31 2023 west
// of UTC, and toLocaleString output differs between Node and browsers. These
// helpers read the calendar date straight from the string and format it with
// fixed English names, so every timezone and the server render agree.
// ---------------------------------------------------------------------------

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export interface CalendarDate {
    year: number;
    month: number; // 1–12
    day: number;
}

export function parseCalendarDate(value?: string | null): CalendarDate | null {
    if (!value) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { year, month, day };
}

/** "Jan 2024" */
export function formatMonth(value?: string | null): string | null {
    const d = parseCalendarDate(value);
    return d ? `${MONTHS_SHORT[d.month - 1]} ${d.year}` : null;
}

/** "Jan 5, 2024" (short) or "January 5, 2024" (long). */
export function formatDay(value?: string | null, style: "short" | "long" = "short"): string {
    const d = parseCalendarDate(value);
    if (!d) return "";
    const names = style === "long" ? MONTHS_LONG : MONTHS_SHORT;
    return `${names[d.month - 1]} ${d.day}, ${d.year}`;
}

/** "2024" */
export function yearOf(value?: string | null): string {
    const d = parseCalendarDate(value);
    return d ? String(d.year) : "";
}

/** Sortable key for a calendar date ("YYYY-MM-DD" compares correctly as a string). */
export function dateKey(value?: string | null): string {
    const d = parseCalendarDate(value);
    if (!d) return "";
    return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------

export function timelineLabel(project: Project): string {
    const start = formatMonth(project.start_date);
    if (!start) return project.is_ongoing ? "Ongoing" : "—";
    const end = project.is_ongoing ? "Present" : formatMonth(project.end_date) ?? "Present";
    return `${start} – ${end}`;
}

export function projectYear(project: Project): string {
    return yearOf(project.start_date ?? project.created_at);
}

export type SortKey = "newest" | "views" | "featured";

function startedAt(p: Project): string {
    return dateKey(p.start_date ?? p.created_at);
}

/** Newest first; ties keep the admin's order. */
function byNewest(a: Project, b: Project): number {
    return startedAt(b).localeCompare(startedAt(a)) || a.order - b.order;
}

export function sortProjects(list: Project[], sort: SortKey): Project[] {
    const sorted = [...list];
    switch (sort) {
        case "views":
            sorted.sort((a, b) => b.view_count - a.view_count || byNewest(a, b));
            break;
        case "featured":
            sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order || byNewest(a, b));
            break;
        default:
            sorted.sort(byNewest);
    }
    return sorted;
}

export function matchesQuery(p: Project, q: string): boolean {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    const haystack = [p.title, p.short_description ?? "", p.technologies.join(" "), p.tags.join(" ")]
        .join(" ")
        .toLowerCase();
    return haystack.includes(needle);
}

/** Route ids are positive integers; anything else is a not-found, not a request. */
export function parseRouteId(raw: string | string[] | undefined): number | null {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value || !/^\d+$/.test(value)) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}
