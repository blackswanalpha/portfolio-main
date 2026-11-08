"use client";

import { useParams } from "next/navigation";
import TestimonialForm from "@/components/admin/TestimonialForm";
import { RecordGate } from "@/components/admin/RecordGate";
import { parseId } from "@/components/admin/forms";
import { useApi } from "@/hooks/useApi";
import type { Testimonial } from "@/lib/api";

export default function EditTestimonialPage() {
    const params = useParams<{ id: string }>();
    const id = parseId(params?.id);
    // The admin endpoint returns the testimonial whatever its status.
    const query = useApi<Testimonial>(id === null ? null : `/testimonials/admin/${id}`);

    return (
        <RecordGate
            query={query}
            invalidId={id === null}
            title="Edit testimonial"
            noun="testimonial"
            back={{ href: "/admin/testimonials", label: "Back to testimonials" }}
        >
            {(t) => <TestimonialForm key={t.id} initial={t} />}
        </RecordGate>
    );
}
