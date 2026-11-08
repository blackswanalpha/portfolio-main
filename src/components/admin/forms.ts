import { ApiError } from "@/lib/api";
import { errorMessage } from "@/components/ui/states";

export type FieldErrors = Record<string, string | undefined>;

interface ApiFieldDetail {
    field?: unknown;
    message?: unknown;
}

/**
 * Field errors from a 422 response. The backend sends
 * `details: [{ field, message }]`; this reads them structurally so it works as
 * soon as `ApiError` carries them (see the api.ts note in the report).
 */
export function apiFieldErrors(err: unknown): FieldErrors {
    const details = (err as { details?: unknown } | null)?.details;
    if (!Array.isArray(details)) return {};
    const out: FieldErrors = {};
    for (const d of details as ApiFieldDetail[]) {
        if (typeof d?.field === "string" && typeof d?.message === "string" && !out[d.field]) {
            out[d.field] = d.message;
        }
    }
    return out;
}

/**
 * Turn a failed save into inline field errors plus one banner message.
 * Field errors for fields the form doesn't show go into the banner so nothing
 * the server said is lost.
 */
export function submitFailure(
    err: unknown,
    knownFields: readonly string[],
    fallback: string,
): { fields: FieldErrors; banner: string } {
    const all = apiFieldErrors(err);
    const fields: FieldErrors = {};
    const unknown: string[] = [];
    for (const [field, message] of Object.entries(all)) {
        if (!message) continue;
        if (knownFields.includes(field)) fields[field] = message;
        else unknown.push(`${field}: ${message}`);
    }
    if (Object.keys(fields).length > 0 || unknown.length > 0) {
        const banner = unknown.length
            ? `The server rejected some values. ${unknown.join(". ")}`
            : "The server rejected some values. Check the highlighted fields.";
        return { fields, banner };
    }
    if (err instanceof ApiError && err.status === 422) {
        return { fields, banner: `The server rejected some values (${err.message}). Check the fields and try again.` };
    }
    return { fields, banner: errorMessage(err, fallback) };
}

/** True when at least one value is set. */
export function hasErrors(errors: FieldErrors): boolean {
    return Object.values(errors).some(Boolean);
}

/** Absolute http(s) URL check for the backend's HttpUrl fields. Empty is valid (sent as null). */
export function urlError(value: string, max = 2083): string | undefined {
    const v = value.trim();
    if (!v) return undefined;
    if (v.length > max) return `Keep it under ${max} characters`;
    try {
        const u = new URL(v);
        if (u.protocol === "http:" || u.protocol === "https:") return undefined;
    } catch {
        /* fall through */
    }
    return "Enter a full URL starting with https://";
}

/** Max-length check. Empty is valid. */
export function maxLengthError(value: string, max: number): string | undefined {
    return value.trim().length > max ? `Keep it under ${max} characters (now ${value.trim().length})` : undefined;
}

/** Whole number check for order/count fields. Empty is valid unless `required`. */
export function integerError(value: string, { min = 0, required = false } = {}): string | undefined {
    const v = value.trim();
    if (!v) return required ? "Required" : undefined;
    if (!/^-?\d+$/.test(v)) return "Use a whole number";
    if (Number(v) < min) return `Use ${min} or more`;
    return undefined;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email format check. Empty is valid. */
export function emailError(value: string): string | undefined {
    const v = value.trim();
    if (!v) return undefined;
    return EMAIL_RE.test(v) ? undefined : "Enter a valid email address";
}

/** "a, b, ,c" -> ["a", "b", "c"]. */
export function splitList(value: string): string[] {
    return value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
}

/** One entry per line. */
export function splitLines(value: string): string[] {
    return value
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);
}

/** Client-side slug fallback (mirrors the backend's _generate_slug). */
export function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Route param -> positive integer id, or null for anything else ("abc", "0", "1.5"). */
export function parseId(raw: string | string[] | undefined): number | null {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (!value || !/^\d+$/.test(value)) return null;
    const n = Number(value);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
}
