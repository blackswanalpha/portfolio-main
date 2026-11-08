import { useAuthStore } from "@/store/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API_PREFIX = "/api/v1";

/** One field-level validation problem from the backend's 422 envelope. */
export interface ApiFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  /** Field-level validation errors (422), when the backend sent them. */
  details?: ApiFieldError[];
  constructor(message: string, status: number, details?: ApiFieldError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res: Response) {
  if (!res.ok) {
    let detail: string = res.statusText;
    let details: ApiFieldError[] | undefined;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
      else if (Array.isArray(data?.detail)) detail = data.detail[0]?.msg ?? detail;
      // Backend wraps errors in a custom envelope: { message, error_code, ... }
      else if (typeof data?.message === "string") detail = data.message;
      // The backend's 422 envelope lists field-level problems in `details`.
      if (Array.isArray(data?.details)) {
        details = data.details.filter(
          (d: { field?: unknown; message?: unknown }) =>
            typeof d?.field === "string" && typeof d?.message === "string",
        );
        if (details && details.length) detail = `${details[0].field}: ${details[0].message}`;
      }
    } catch {
      /* non-JSON error body */
    }
    if (res.status === 401) {
      // token expired or invalid — drop it so guards redirect to login
      useAuthStore.getState().logout();
    }
    throw new ApiError(detail, res.status, details);
  }
  if (res.status === 204) return null;
  return res.json();
}

function url(path: string): string {
  return `${BASE_URL}${API_PREFIX}${path}`;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  full_name?: string | null;
  bio?: string | null;
  profile_image?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string | null;
}

/** Payload for PATCH /auth/me (self-service profile update). */
export interface ProfileUpdatePayload {
  full_name?: string | null;
  email?: string;
  username?: string;
  bio?: string | null;
  profile_image?: string | null;
}

/** Payload for POST /auth/change-password. */
export interface PasswordChangePayload {
  current_password: string;
  new_password: string;
}

// ---- Site settings (GET public, PUT admin: /settings) ----

export interface SiteSettings {
  professional_title?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  show_freelance: boolean;
  available_for_work: boolean;
  updated_at?: string | null;
}

export type SiteSettingsUpdate = Partial<Omit<SiteSettings, "updated_at">>;

export interface UploadResponse {
  message: string;
  file: {
    id: number;
    filename: string;
    url: string;
    file_type: string;
    file_size: number;
    mime_type?: string | null;
    width?: number | null;
    height?: number | null;
    uploaded_at: string;
  };
}

export const api = {
  baseUrl: BASE_URL,

  /** GET a JSON resource. Pass `signal` to abort superseded requests (see useApi). */
  async get<T>(path: string, init?: { signal?: AbortSignal }): Promise<T> {
    const res = await fetch(url(path), {
      headers: { ...authHeader() },
      cache: "no-store",
      signal: init?.signal,
    });
    return handle(res) as Promise<T>;
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(url(path), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handle(res) as Promise<T>;
  },

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(url(path), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handle(res) as Promise<T>;
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(url(path), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handle(res) as Promise<T>;
  },

  async del<T>(path: string): Promise<T> {
    const res = await fetch(url(path), {
      method: "DELETE",
      headers: { ...authHeader() },
    });
    return handle(res) as Promise<T>;
  },

  /** OAuth2 password login — sends form-encoded credentials. */
  async login(username: string, password: string): Promise<TokenResponse> {
    const form = new URLSearchParams();
    form.set("username", username);
    form.set("password", password);
    const res = await fetch(url("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    return handle(res) as Promise<TokenResponse>;
  },

  /** Fetch the currently authenticated user (verifies the stored token). */
  async me(): Promise<UserResponse> {
    return api.get<UserResponse>("/auth/me");
  },

  /** Upload a single file (image/video/audio) to one of the /upload/* endpoints. */
  async uploadFile(path: string, file: File): Promise<UploadResponse> {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch(url(path), {
      method: "POST",
      headers: { ...authHeader() },
      body: fd,
    });
    return handle(res) as Promise<UploadResponse>;
  },
};

/**
 * Resolve a backend media path (e.g. "/uploads/images/x.png") to an absolute URL.
 * Pass-through for already-absolute URLs and empty values.
 */
export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_URL}${path}`;
}

/**
 * Fire-and-forget page-view tracking. Hits the public `POST /analytics/track`
 * endpoint (no auth) and swallows any error so visitor tracking can never break
 * the page. `keepalive` lets the request survive a route change / tab close.
 */
export interface PageViewPayload {
  page_path: string;
  referrer?: string;
  session_id?: string;
  time_on_page?: number;
}

export function trackPageView(payload: PageViewPayload): void {
  try {
    fetch(`${BASE_URL}${API_PREFIX}/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking is best-effort */
  }
}

/**
 * Send a page view via `navigator.sendBeacon` — the reliable way to record a
 * view as the tab is being hidden/closed. Falls back to {@link trackPageView}.
 */
export function trackPageViewBeacon(payload: PageViewPayload): void {
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      if (navigator.sendBeacon(`${BASE_URL}${API_PREFIX}/analytics/track`, blob)) {
        return;
      }
    }
  } catch {
    /* fall through to fetch */
  }
  trackPageView(payload);
}

// ---- Shared response types ----

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  cover_image?: string | null;
  tags: string[];
  is_published: boolean;
  order: number;
  view_count: number;
  published_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export type GalleryMediaType = "image" | "video" | "audio";

export interface GalleryItem {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  media_type: GalleryMediaType;
  media_url: string;
  thumbnail_url?: string | null;
  category?: string | null;
  tags: string[];
  is_published: boolean;
  order: number;
  published_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ---- Admin dashboard (GET /analytics/dashboard) ----

export interface DashboardMetrics {
  projects_count: number;
  projects_new_in_period: number;
  freelance_active_count: number;
  freelance_total: number;
  total_views: number;
  views_trend: number;
  testimonials_count: number;
  testimonials_new_in_period: number;
  avg_session_seconds: number;
}

export interface DailyViewPoint {
  date: string; // "YYYY-MM-DD"
  views: number;
}

export type DashboardActivityType =
  | "project"
  | "contact"
  | "testimonial"
  | "blog"
  | "gallery";

export interface DashboardActivityItem {
  type: DashboardActivityType;
  title: string;
  timestamp: string; // ISO 8601
}

export interface DashboardData {
  metrics: DashboardMetrics;
  daily_views: DailyViewPoint[];
  period_days: number;
  activity: DashboardActivityItem[];
}

// ---- Analytics page (GET /analytics/overview, /projects/top, /testimonials/ratings) ----

export interface TopPage {
  path: string;
  views: number;
}

/** Matches the backend `DashboardOverview` (GET /analytics/overview). */
export interface AnalyticsOverview {
  total_views: number;
  unique_visitors: number;
  projects_count: number;
  testimonials_count: number;
  contact_messages_count: number;
  views_trend: number;
  visitors_trend: number;
  top_pages: TopPage[];
  views_by_device: Record<string, number>;
}

export interface TopProject {
  project_id: number;
  title: string;
  slug: string;
  views: number;
}

export interface RatingsBreakdown {
  total_testimonials: number;
  average_rating: number;
  /** Count per rating level (1..5). Keys arrive as strings over JSON. */
  rating_distribution: Record<string, number>;
}

// ---- Projects (GET/POST/PUT /projects) ----

export type ProjectStatus = "draft" | "published" | "archived" | "featured";

export type ProjectCategory =
  | "web_app"
  | "mobile_app"
  | "desktop_app"
  | "api"
  | "library"
  | "tool"
  | "other";

export interface Project {
  id: number;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  technologies: string[];
  category: ProjectCategory;
  /** Responses only ever return "draft" | "published"; "featured" lives on `featured`. */
  status: ProjectStatus;
  featured: boolean;
  start_date?: string | null; // "YYYY-MM-DD"
  end_date?: string | null;
  is_ongoing: boolean;
  demo_url?: string | null;
  source_code_url?: string | null;
  thumbnail_url?: string | null;
  order: number;
  tags: string[];
  created_at: string;
  updated_at?: string | null;
  view_count: number;
  media_count: number;
}

// ---- Work experience (GET/POST/PUT /work-experience) ----

export interface WorkExperience {
  id: number;
  company: string;
  position: string;
  location?: string | null;
  start_date: string; // "YYYY-MM-DD"
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  responsibilities: string[];
  technologies: string[];
  company_website?: string | null;
  company_logo_url?: string | null;
  is_public: boolean;
  is_featured: boolean;
  order: number;
  created_at: string;
  updated_at?: string | null;
  duration_months?: number | null;
}

// ---- Testimonials (public GET, admin GET/POST/PUT/PATCH/DELETE /testimonials) ----

export type TestimonialStatus = "pending" | "approved" | "rejected" | "hidden";

export interface Testimonial {
  id: number;
  client_name: string;
  client_email?: string | null;
  client_company?: string | null;
  client_position?: string | null;
  client_photo_url?: string | null;
  rating: number; // 1–5
  content: string;
  is_featured: boolean;
  status: TestimonialStatus;
  order: number;
  created_at: string;
  updated_at?: string | null;
  is_verified?: boolean;
}

/** Public list shape from `GET /testimonials/` (published only; `content` is a ≤200-char excerpt). */
export interface TestimonialListItem {
  id: number;
  client_name: string;
  client_company?: string | null;
  client_position?: string | null;
  client_photo_url?: string | null;
  rating: number; // 1–5
  content: string;
  is_featured: boolean;
  order: number;
  created_at: string;
}

// ---- Freelance services (GET/POST/PUT /freelance) ----

export type FreelanceStatus = "active" | "paused" | "discontinued";

export type PricingType = "hourly" | "fixed" | "monthly" | "project_based";

export interface FreelanceWork {
  id: number;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  pricing_type: PricingType;
  base_price: number;
  currency: string;
  technologies: string[];
  skills: string[];
  deliverables: string[];
  status: FreelanceStatus;
  featured: boolean;
  thumbnail_url?: string | null;
  portfolio_url?: string | null;
  order: number;
  estimated_delivery_days?: number | null;
  revisions_included: number;
  created_at: string;
  updated_at?: string | null;
  inquiry_count: number;
  formatted_price: string;
}

export interface FreelanceStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  on_hold_projects: number;
  total_revenue: number;
  public_projects: number;
}

// ---- Contact / Inquiries (public POST /contact, admin GET/PATCH/DELETE) ----

export type InquiryStatus = "new" | "read" | "replied" | "archived" | "spam";

export type ContactReason =
  | "job_offer"
  | "freelance_project"
  | "collaboration"
  | "general_inquiry"
  | "feedback"
  | "media_inquiry"
  | "other";

export interface InquiryListItem {
  id: number;
  name: string;
  email: string;
  company?: string | null;
  subject: string;
  message_preview: string;
  contact_reason: ContactReason;
  status: InquiryStatus;
  priority: string;
  is_spam: boolean;
  created_at: string;
}

export interface InquiryDetail {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  subject: string;
  message: string;
  contact_reason: ContactReason;
  budget_range?: string | null;
  timeline?: string | null;
  how_found?: string | null;
  status: InquiryStatus;
  priority: string;
  ip_address?: string | null;
  user_agent?: string | null;
  is_spam: boolean;
  spam_score?: number | null;
  admin_notes?: string | null;
  read_at?: string | null;
  replied_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ContactStats {
  total_messages: number;
  new_messages: number;
  replied_messages: number;
  archived_messages: number;
  spam_messages: number;
  by_reason: Record<string, number>;
  avg_response_time_hours?: number | null;
}

/** Payload for the public contact form (POST /contact/). */
export interface ContactSubmitPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  contact_reason?: ContactReason;
  honeypot?: string | null;
}
