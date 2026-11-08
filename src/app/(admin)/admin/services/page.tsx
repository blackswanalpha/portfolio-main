"use client";

import Link from "next/link";
import { Button, HStack } from "@chakra-ui/react";
import { LuPencil, LuPlus, LuRotateCcw, LuTrash2, LuWrench } from "react-icons/lu";
import toast from "react-hot-toast";
import {
    ConfirmDialog,
    ListPanel,
    ListRow,
    PageHeader,
    RowActions,
    RowIconButton,
    RowIconLink,
    RowMedia,
    RowText,
    primaryButton,
    secondaryButton,
} from "@/components/admin/AdminUI";
import { countLabel, useConfirmAction } from "@/components/admin/hooks";
import { EmptyState } from "@/components/ui/states";
import { useServicesStore, SERVICE_ICONS, type Service } from "@/store/services";

function NewServiceButton() {
    return (
        <Button asChild size="sm" {...primaryButton}>
            <Link href="/admin/services/create">
                <LuPlus aria-hidden /> New service
            </Link>
        </Button>
    );
}

export default function AdminServicesListPage() {
    const services = useServicesStore((s) => s.services);
    const removeService = useServicesStore((s) => s.removeService);
    const reset = useServicesStore((s) => s.reset);
    const confirmDelete = useConfirmAction<Service>();
    const confirmReset = useConfirmAction<true>();

    const ordered = [...services].sort((a, b) => a.order - b.order);

    const remove = () =>
        confirmDelete.confirm(async (s) => {
            removeService(s.id);
            toast.success("Service deleted");
        });

    const restore = () =>
        confirmReset.confirm(async () => {
            reset();
            toast.success("Services reset to the defaults");
        });

    const resetButton = (
        <Button size="sm" {...secondaryButton} onClick={() => confirmReset.ask(true)}>
            <LuRotateCcw aria-hidden /> Reset
        </Button>
    );

    return (
        <>
            <PageHeader
                title="Services"
                description="Saved in this browser only. These cards don't reach the server or the public site."
                actions={
                    <>
                        {resetButton}
                        <NewServiceButton />
                    </>
                }
            />

            {ordered.length === 0 ? (
                <EmptyState
                    icon={<LuWrench />}
                    title="No services"
                    description="Add a service card, or reset to restore the default cards."
                    action={
                        <HStack gap={2}>
                            {resetButton}
                            <NewServiceButton />
                        </HStack>
                    }
                />
            ) : (
                <ListPanel label={countLabel(ordered.length, "service")}>
                    {ordered.map((s) => {
                        const ServiceIcon = SERVICE_ICONS[s.iconKey] ?? SERVICE_ICONS.code;
                        return (
                            <ListRow key={s.id}>
                                <HStack gap={4} flex={1} minW={0}>
                                    <RowMedia>
                                        <ServiceIcon aria-hidden />
                                    </RowMedia>
                                    <RowText
                                        title={s.title}
                                        href={`/admin/services/${s.id}/edit`}
                                        meta={[`${s.priceLabel} ${s.price}`.trim(), countLabel(s.features.length, "feature")]}
                                    />
                                </HStack>
                                <RowActions>
                                    <RowIconLink label="Edit" icon={<LuPencil />} href={`/admin/services/${s.id}/edit`} />
                                    <RowIconButton label="Delete" tone="danger" icon={<LuTrash2 />} onClick={() => confirmDelete.ask(s)} />
                                </RowActions>
                            </ListRow>
                        );
                    })}
                </ListPanel>
            )}

            <ConfirmDialog
                open={confirmDelete.open}
                title="Delete service?"
                description={confirmDelete.target ? `"${confirmDelete.target.title}" will be removed from this browser. This can't be undone.` : undefined}
                confirmLabel="Delete service"
                pending={confirmDelete.pending}
                error={confirmDelete.error}
                onConfirm={remove}
                onCancel={confirmDelete.cancel}
            />
            <ConfirmDialog
                open={confirmReset.open}
                title="Reset services?"
                description="All cards go back to the original defaults. Your changes in this browser will be lost."
                confirmLabel="Reset services"
                pending={confirmReset.pending}
                error={confirmReset.error}
                onConfirm={restore}
                onCancel={confirmReset.cancel}
            />
        </>
    );
}
