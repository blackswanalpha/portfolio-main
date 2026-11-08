"use client";

import { useParams } from "next/navigation";
import ExperienceForm from "@/components/admin/ExperienceForm";
import { RecordGate } from "@/components/admin/RecordGate";
import { parseId } from "@/components/admin/forms";
import { useApi } from "@/hooks/useApi";
import type { WorkExperience } from "@/lib/api";

export default function EditExperiencePage() {
    const params = useParams<{ id: string }>();
    const id = parseId(params?.id);
    const query = useApi<WorkExperience>(id === null ? null : `/work-experience/${id}`);

    return (
        <RecordGate
            query={query}
            invalidId={id === null}
            title="Edit experience"
            noun="role"
            back={{ href: "/admin/experience", label: "Back to experience" }}
        >
            {(x) => <ExperienceForm key={x.id} initial={x} />}
        </RecordGate>
    );
}
