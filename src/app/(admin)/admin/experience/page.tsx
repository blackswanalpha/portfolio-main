"use client";

import Link from "next/link";
import { Button } from "@chakra-ui/react";
import { LuEye, LuEyeOff, LuHistory, LuPencil, LuPlus, LuStar, LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";
import {
    ConfirmDialog,
    ListPanel,
    ListRow,
    ListSkeleton,
    PageHeader,
    RowActions,
    RowIconButton,
    RowIconLink,
    RowText,
    StatusBadge,
    primaryButton,
} from "@/components/admin/AdminUI";
import { countLabel, dropItem, patchItem, useConfirmAction, useRowPending } from "@/components/admin/hooks";
import { formatMonth } from "@/components/admin/format";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { api, type Paginated, type WorkExperience } from "@/lib/api";

const LIST_PATH = "/work-experience/?public_only=false&page_size=100";

function NewExperienceButton() {
    return (
        <Button asChild size="sm" {...primaryButton}>
            <Link href="/admin/experience/create">
                <LuPlus aria-hidden /> New experience
            </Link>
        </Button>
    );
}

export default function AdminExperienceListPage() {
    const { data, error, loading, refreshing, reload, setData } = useApi<Paginated<WorkExperience>>(LIST_PATH);
    const { pendingAction, run } = useRowPending();
    const confirmDelete = useConfirmAction<WorkExperience>();

    const toggleVisibility = (x: WorkExperience) =>
        run(x.id, "visibility", async () => {
            try {
                const res = await api.patch<{ id: number; is_public: boolean }>(`/work-experience/${x.id}/toggle-visibility`);
                setData((prev) => patchItem(prev, x.id, (item) => ({ ...item, is_public: res.is_public })));
                toast.success(res.is_public ? "Role is public" : "Role hidden from the public site");
            } catch (err) {
                toast.error(errorMessage(err, "Couldn't update visibility."));
            } finally {
                reload();
            }
        });

    const toggleFeature = (x: WorkExperience) =>
        run(x.id, "feature", async () => {
            try {
                const res = await api.patch<{ id: number; is_featured: boolean }>(`/work-experience/${x.id}/feature`);
                setData((prev) => patchItem(prev, x.id, (item) => ({ ...item, is_featured: res.is_featured })));
                toast.success(res.is_featured ? "Role featured" : "Role unfeatured");
            } catch (err) {
                toast.error(errorMessage(err, "Couldn't update the role."));
            } finally {
                reload();
            }
        });

    const remove = () =>
        confirmDelete.confirm(async (x) => {
            await api.del(`/work-experience/${x.id}`);
            setData((prev) => dropItem(prev, x.id));
            toast.success("Experience deleted");
            reload();
        });

    const items = data?.items ?? [];

    return (
        <>
            <PageHeader
                title="Experience"
                description={data ? countLabel(data.total, "role") : "Roles on the public experience timeline"}
                actions={<NewExperienceButton />}
            />

            {error && !data ? (
                <ErrorState title="Couldn't load experience" description={errorMessage(error)} onRetry={reload} retrying={refreshing} />
            ) : loading ? (
                <ListSkeleton actions={4} label="Loading experience" />
            ) : items.length === 0 ? (
                <EmptyState
                    icon={<LuHistory />}
                    title="No experience yet"
                    description="Add a role to start the experience timeline on the public site."
                    action={<NewExperienceButton />}
                />
            ) : (
                <ListPanel label="Experience">
                    {items.map((x) => {
                        const action = pendingAction(x.id);
                        const end = x.is_current ? "Present" : formatMonth(x.end_date);
                        return (
                            <ListRow key={x.id} aria-busy={!!action}>
                                <RowText
                                    title={x.position}
                                    href={`/admin/experience/${x.id}/edit`}
                                    badges={
                                        <>
                                            <StatusBadge tone={x.is_public ? "success" : "neutral"}>{x.is_public ? "Public" : "Hidden"}</StatusBadge>
                                            {x.is_featured ? <StatusBadge tone="info">Featured</StatusBadge> : null}
                                        </>
                                    }
                                    meta={[x.company, `${formatMonth(x.start_date)}${end ? ` – ${end}` : ""}`, x.location]}
                                />
                                <RowActions>
                                    <RowIconButton
                                        label={x.is_featured ? "Unfeature" : "Feature"}
                                        pressed={x.is_featured}
                                        icon={<LuStar fill={x.is_featured ? "currentColor" : "none"} />}
                                        onClick={() => toggleFeature(x)}
                                        loading={action === "feature"}
                                        disabled={!!action}
                                    />
                                    <RowIconButton
                                        label={x.is_public ? "Hide" : "Make public"}
                                        icon={x.is_public ? <LuEyeOff /> : <LuEye />}
                                        onClick={() => toggleVisibility(x)}
                                        loading={action === "visibility"}
                                        disabled={!!action}
                                    />
                                    <RowIconLink label="Edit" icon={<LuPencil />} href={`/admin/experience/${x.id}/edit`} disabled={!!action} />
                                    <RowIconButton label="Delete" tone="danger" icon={<LuTrash2 />} onClick={() => confirmDelete.ask(x)} disabled={!!action} />
                                </RowActions>
                            </ListRow>
                        );
                    })}
                </ListPanel>
            )}

            <ConfirmDialog
                open={confirmDelete.open}
                title="Delete experience?"
                description={
                    confirmDelete.target
                        ? `"${confirmDelete.target.position} at ${confirmDelete.target.company}" will be removed from the timeline. This can't be undone.`
                        : undefined
                }
                confirmLabel="Delete experience"
                pending={confirmDelete.pending}
                error={confirmDelete.error}
                onConfirm={remove}
                onCancel={confirmDelete.cancel}
            />
        </>
    );
}
