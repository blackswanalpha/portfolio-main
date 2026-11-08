import type { BadgeTone } from "@/components/admin/AdminUI";
import type { ContactReason, InquiryStatus } from "@/lib/api";

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
    new: "New",
    read: "Read",
    replied: "Replied",
    archived: "Archived",
    spam: "Spam",
};

export const INQUIRY_STATUS_TONE: Record<InquiryStatus, BadgeTone> = {
    new: "info",
    read: "neutral",
    replied: "success",
    archived: "neutral",
    spam: "danger",
};

export const REASON_LABEL: Record<ContactReason, string> = {
    job_offer: "Job offer",
    freelance_project: "Freelance project",
    collaboration: "Collaboration",
    general_inquiry: "General inquiry",
    feedback: "Feedback",
    media_inquiry: "Media inquiry",
    other: "Other",
};
