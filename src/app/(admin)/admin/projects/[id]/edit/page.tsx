"use client";

import { useParams } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { RecordGate } from "@/components/admin/RecordGate";
import { parseId } from "@/components/admin/forms";
import { useApi } from "@/hooks/useApi";
import type { Project } from "@/lib/api";

export default function EditProjectPage() {
    const params = useParams<{ id: string }>();
    const id = parseId(params?.id);
    const query = useApi<Project>(id === null ? null : `/projects/id/${id}`);

    return (
        <RecordGate
            query={query}
            invalidId={id === null}
            title="Edit project"
            noun="project"
            back={{ href: "/admin/projects", label: "Back to projects" }}
        >
            {(project) => <ProjectForm key={project.id} initial={project} />}
        </RecordGate>
    );
}
