"use client";

import { useParams } from "next/navigation";
import { Box } from "@chakra-ui/react";
import ServiceForm from "@/components/admin/ServiceForm";
import { NotFoundState, PageHeader } from "@/components/admin/AdminUI";
import { parseId } from "@/components/admin/forms";
import { useServicesStore } from "@/store/services";

const BACK = { href: "/admin/services", label: "Back to services" };

export default function EditServicePage() {
    const params = useParams<{ id: string }>();
    const id = parseId(params?.id);
    // Local (browser-only) store: available synchronously, no loading state.
    const service = useServicesStore((s) => (id === null ? undefined : s.services.find((x) => x.id === id)));

    if (!service) {
        return (
            <Box maxW="3xl">
                <PageHeader title="Edit service" back={BACK} />
                <NotFoundState title="This service doesn't exist" backHref={BACK.href} backLabel={BACK.label} />
            </Box>
        );
    }

    return <ServiceForm key={service.id} initial={service} />;
}
