import { api } from "@/lib/api";

/*
 * POST helper for the public forms. Unlike api.post it keeps the backend's
 * per-field validation messages, so the contact form and the review drawer
 * can show each one next to its input.
 */

export type SubmitErrorKind = "validation" | "rate" | "server" | "network" | "client";

export class SubmitError extends Error {
    readonly status: number;
    readonly kind: SubmitErrorKind;
    /** Server messages keyed by request field name. */
    readonly fields: Record<string, string>;
    /** Seconds to wait before retrying, when the server said so. */
    readonly retryAfter: number | null;

    constructor(message: string, status: number, kind: SubmitErrorKind, fields: Record<string, string> = {}, retryAfter: number | null = null) {
        super(message);
        this.name = "SubmitError";
        this.status = status;
        this.kind = kind;
        this.fields = fields;
        this.retryAfter = retryAfter;
    }
}

// Mirrors API_PREFIX in lib/api.ts.
const API_PREFIX = "/api/v1";

function cleanMessage(message: string) {
    return message.replace(/^Value error,\s*/i, "").replace(/^value is not a valid email address:\s*/i, "");
}

/** Accepts the app's error envelope ({ details: [{ field, message }] }) and FastAPI's default ({ detail: [{ loc, msg }] }). */
function fieldErrors(payload: unknown): Record<string, string> {
    const fields: Record<string, string> = {};
    if (!payload || typeof payload !== "object") return fields;
    const record = payload as { details?: unknown; detail?: unknown };
    const list = Array.isArray(record.details) ? record.details : Array.isArray(record.detail) ? record.detail : [];
    for (const item of list) {
        if (!item || typeof item !== "object") continue;
        const entry = item as { field?: unknown; message?: unknown; loc?: unknown; msg?: unknown };
        const loc = Array.isArray(entry.loc) ? entry.loc : [];
        const field = typeof entry.field === "string" ? entry.field : typeof loc[loc.length - 1] === "string" ? (loc[loc.length - 1] as string) : null;
        const message = typeof entry.message === "string" ? entry.message : typeof entry.msg === "string" ? entry.msg : null;
        if (field && message && !fields[field]) fields[field] = cleanMessage(message);
    }
    return fields;
}

function topMessage(payload: unknown): string | null {
    if (!payload || typeof payload !== "object") return null;
    const record = payload as { message?: unknown; detail?: unknown };
    if (typeof record.detail === "string") return record.detail;
    if (typeof record.message === "string") return record.message;
    return null;
}

function retryAfterSeconds(response: Response): number | null {
    const header = response.headers.get("Retry-After");
    if (!header) return null;
    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
    const date = Date.parse(header);
    return Number.isNaN(date) ? null : Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

export async function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${api.baseUrl}${API_PREFIX}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal,
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw error;
        throw new SubmitError("Couldn't reach the server. Check your connection, then send it again.", 0, "network");
    }

    if (response.ok) {
        if (response.status === 204) return null as T;
        return (await response.json().catch(() => null)) as T;
    }

    const payload: unknown = await response.json().catch(() => null);
    const fields = fieldErrors(payload);
    const status = response.status;

    if (status === 422 || status === 400) {
        const first = Object.values(fields)[0];
        return Promise.reject(
            new SubmitError(first ?? topMessage(payload) ?? "Some details need another look.", status, "validation", fields),
        );
    }
    if (status === 429) {
        const wait = retryAfterSeconds(response);
        const when = wait ? `in ${wait} second${wait === 1 ? "" : "s"}` : "in a minute";
        return Promise.reject(
            new SubmitError(`Too many messages in a short time. Your text is still here, so try again ${when}.`, status, "rate", {}, wait),
        );
    }
    if (status >= 500) {
        return Promise.reject(
            new SubmitError("The server had a problem and nothing was sent. Your text is still here, so try again in a moment.", status, "server"),
        );
    }
    return Promise.reject(new SubmitError(topMessage(payload) ?? "That didn't go through. Try again in a moment.", status, "client", fields));
}
