/**
 * Formatting for admin screens. One locale everywhere so numbers and dates read
 * the same on every page.
 *
 * - Calendar dates ("YYYY-MM-DD") are parsed as UTC midnight and formatted in
 *   UTC, so they never shift a day with the viewer's timezone.
 * - Server timestamps arrive as naive ISO strings that are UTC
 *   ("2026-11-08T10:04:58"), some with a trailing "Z". They are formatted in
 *   the viewer's timezone. Admin content only renders on the client (the admin
 *   layout gates it behind the auth check), so this never runs during SSR.
 */

const LOCALE = "en-US";

const CALENDAR_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const HAS_ZONE_RE = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/** "YYYY-MM-DD" -> Date at UTC midnight. Null for empty or malformed input. */
export function parseCalendarDate(value?: string | null): Date | null {
    if (!value) return null;
    const m = CALENDAR_RE.exec(value.slice(0, 10));
    if (!m) return null;
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

/** Server timestamp -> Date. Naive values are treated as UTC. */
export function parseServerDate(value?: string | null): Date | null {
    if (!value) return null;
    if (CALENDAR_RE.test(value)) return parseCalendarDate(value);
    const d = new Date(HAS_ZONE_RE.test(value) ? value : `${value}Z`);
    return Number.isNaN(d.getTime()) ? null : d;
}

const calendarDay = new Intl.DateTimeFormat(LOCALE, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
const calendarMonth = new Intl.DateTimeFormat(LOCALE, { year: "numeric", month: "short", timeZone: "UTC" });
const calendarShort = new Intl.DateTimeFormat(LOCALE, { month: "short", day: "numeric", timeZone: "UTC" });
const instantDay = new Intl.DateTimeFormat(LOCALE, { year: "numeric", month: "short", day: "numeric" });
const instantDateTime = new Intl.DateTimeFormat(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
});
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const decimal1 = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** "2022-01-15" -> "Jan 2022". */
export function formatMonth(value?: string | null): string {
    const d = parseCalendarDate(value);
    return d ? calendarMonth.format(d) : "";
}

/** "2022-01-15" -> "Jan 15, 2022". */
export function formatCalendarDay(value?: string | null): string {
    const d = parseCalendarDate(value);
    return d ? calendarDay.format(d) : "";
}

/** "2022-01-15" -> "Jan 15" (chart axis). */
export function formatCalendarShort(value?: string | null): string {
    const d = parseCalendarDate(value);
    return d ? calendarShort.format(d) : "";
}

/** Server timestamp -> "Nov 8, 2026". */
export function formatDate(value?: string | null): string {
    const d = parseServerDate(value);
    return d ? instantDay.format(d) : "";
}

/** Server timestamp -> "Nov 8, 2026, 1:04 PM". */
export function formatDateTime(value?: string | null): string {
    const d = parseServerDate(value);
    return d ? instantDateTime.format(d) : "";
}

/** 12345 -> "12,345". */
export function formatNumber(n: number): string {
    return integer.format(n);
}

/** 4.666 -> "4.7". */
export function formatDecimal(n: number): string {
    return decimal1.format(n);
}

/** 134 -> "2m 14s", 14 -> "14s". */
export function formatDuration(totalSeconds: number): string {
    const s = Math.max(0, Math.round(totalSeconds));
    const mins = Math.floor(s / 60);
    const rem = s % 60;
    return mins > 0 ? `${mins}m ${rem}s` : `${rem}s`;
}

/** Signed percent change, e.g. "+12%", "-3%", "0%". */
export function formatPercentChange(pct: number): { text: string; tone: "up" | "down" | "neutral" } {
    const rounded = Math.round(pct);
    if (rounded > 0) return { text: `+${rounded}%`, tone: "up" };
    if (rounded < 0) return { text: `${rounded}%`, tone: "down" };
    return { text: "0%", tone: "neutral" };
}

/** "5 minutes ago" style label relative to `now` (ms). Falls back to a date after a week. */
export function formatRelative(value: string | null | undefined, now: number): string {
    const d = parseServerDate(value);
    if (!d) return "";
    const diffSec = Math.max(0, Math.round((now - d.getTime()) / 1000));
    if (diffSec < 60) return "Just now";
    const min = Math.floor(diffSec / 60);
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return day === 1 ? "Yesterday" : `${day} days ago`;
    return instantDay.format(d);
}

/** "YYYY-MM-DD" for today minus `days`, in UTC (matches the backend's date math). */
export function utcDateDaysAgo(days: number, from: Date = new Date()): string {
    const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString().slice(0, 10);
}

/** 4500, "USD" -> "$4,500.00". Falls back to "XYZ 4,500.00" for unknown currency codes. */
export function formatMoney(amount: number | string, currency: string): string {
    const n = typeof amount === "number" ? amount : Number(amount);
    if (!Number.isFinite(n)) return String(amount);
    try {
        return new Intl.NumberFormat(LOCALE, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    } catch {
        return `${currency} ${new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
    }
}
