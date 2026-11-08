/*
 * Deterministic date formatting for API values. "YYYY-MM-DD" is a calendar
 * date, so it is parsed as numbers and never passed through Date (which would
 * read it as UTC midnight and can shift it a day in the visitor's time zone).
 */

/** Public path of the CV. The About button renders only when public/resume.pdf exists (checked in app/page.tsx). */
export const RESUME_URL = "/resume.pdf";

const MONTHS =["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface CalendarDate {
    year: number;
    month: number; // 1-12
    day: number;
}

/** Parse the date part of "YYYY-MM-DD" or an ISO timestamp. */
export function parseCalendarDate(value?: string | null): CalendarDate | null {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { year, month, day };
}

/** "Feb 2023" */
export function formatMonthYear(value?: string | null): string | null {
    const date = parseCalendarDate(value);
    return date ? `${MONTHS[date.month - 1]} ${date.year}` : null;
}

/** "Feb 2023 – Present", "Jun 2020 – Jan 2023", or just the start. */
export function formatDateRange(start?: string | null, end?: string | null, ongoing = false): string | null {
    const from = formatMonthYear(start);
    if (!from) return null;
    if (ongoing) return `${from} – Present`;
    const to = formatMonthYear(end);
    return to && to !== from ? `${from} – ${to}` : from;
}
