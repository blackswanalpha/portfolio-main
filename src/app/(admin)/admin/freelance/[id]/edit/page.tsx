"use client";

import { useParams } from "next/navigation";
import FreelanceForm from "@/components/admin/FreelanceForm";
import { RecordGate } from "@/components/admin/RecordGate";
import { parseId } from "@/components/admin/forms";
import { useApi } from "@/hooks/useApi";
import type { FreelanceWork } from "@/lib/api";

export default function EditFreelancePage() {
    const params = useParams<{ id: string }>();
    const id = parseId(params?.id);
    const query = useApi<FreelanceWork>(id === null ? null : `/freelance/${id}`);

    return (
        <RecordGate
            query={query}
            invalidId={id === null}
            title="Edit freelance service"
            noun="service"
            back={{ href: "/admin/freelance", label: "Back to freelance" }}
            fields={8}
        >
            {(work) => <FreelanceForm key={work.id} initial={work} />}
        </RecordGate>
    );
}
