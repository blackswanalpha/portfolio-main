"use client";

import Link from "next/link";
import { Button, HStack, Image } from "@chakra-ui/react";
import { LuEye, LuEyeOff, LuFolderOpen, LuPencil, LuPlus, LuStar, LuTrash2 } from "react-icons/lu";
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
    RowMedia,
    RowText,
    StatusBadge,
    primaryButton,
} from "@/components/admin/AdminUI";
import { countLabel, dropItem, patchItem, useConfirmAction, useRowPending } from "@/components/admin/hooks";
import { formatNumber } from "@/components/admin/format";
import { PROJECT_CATEGORIES } from "@/components/admin/ProjectForm";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { api, mediaUrl, type Paginated, type Project } from "@/lib/api";

const LIST_PATH = "/projects/?published_only=false&page_size=100";
const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(PROJECT_CATEGORIES.map((c) => [c.value, c.label]));

function NewProjectButton() {
    return (
        <Button asChild size="sm" {...primaryButton}>
            <Link href="/admin/projects/create">
                <LuPlus aria-hidden /> New project
            </Link>
        </Button>
    );
}

export default function AdminProjectsListPage() {
    const { data, error, loading, refreshing, reload, setData } = useApi<Paginated<Project>>(LIST_PATH);
    const { pendingAction, run } = useRowPending();
    const confirmDelete = useConfirmAction<Project>();

    const togglePublish = (p: Project) =>
        run(p.id, "publish", async () => {
            const next = p.status === "published" ? "draft" : "published";
            try {
                // Send featured too: the backend's status branch would otherwise reset it.
                const updated = await api.put<Project>(`/projects/${p.id}`, { status: next, featured: p.featured });
                setData((prev) => patchItem(prev, p.id, () => updated));
                toast.success(next === "published" ? "Project published" : "Project moved to drafts");
            } catch (err) {
                toast.error(errorMessage(err, "Couldn't update the project."));
            } finally {
                reload();
            }
        });

    const toggleFeature = (p: Project) =>
        run(p.id, "feature", async () => {
            try {
                const res = await api.patch<{ id: number; is_featured: boolean }>(`/projects/${p.id}/feature`);
                setData((prev) => patchItem(prev, p.id, (item) => ({ ...item, featured: res.is_featured })));
                toast.success(res.is_featured ? "Project featured" : "Project unfeatured");
            } catch (err) {
                toast.error(errorMessage(err, "Couldn't update the project."));
            } finally {
                reload();
            }
        });

    const remove = () =>
        confirmDelete.confirm(async (p) => {
            await api.del(`/projects/${p.id}`);
            setData((prev) => dropItem(prev, p.id));
            toast.success("Project deleted");
            reload();
        });

    const items = data?.items ?? [];

    return (
        <>
            <PageHeader
                title="Projects"
                description={data ? countLabel(data.total, "project") : "Case studies shown on the public projects page"}
                actions={<NewProjectButton />}
            />

            {error && !data ? (
                <ErrorState title="Couldn't load projects" description={errorMessage(error)} onRetry={reload} retrying={refreshing} />
            ) : loading ? (
                <ListSkeleton media actions={4} label="Loading projects" />
            ) : items.length === 0 ? (
                <EmptyState
                    icon={<LuFolderOpen />}
                    title="No projects yet"
                    description="Add a project, then publish it to show it on the public projects page."
                    action={<NewProjectButton />}
                />
            ) : (
                <ListPanel label="Projects">
                    {items.map((p) => {
                        const action = pendingAction(p.id);
                        const published = p.status === "published";
                        return (
                            <ListRow key={p.id} aria-busy={!!action}>
                                <HStack gap={4} flex={1} minW={0}>
                                    <RowMedia>
                                        {p.thumbnail_url ? (
                                            <Image src={mediaUrl(p.thumbnail_url)} alt="" w="full" h="full" objectFit="cover" />
                                        ) : (
                                            <LuFolderOpen aria-hidden />
                                        )}
                                    </RowMedia>
                                    <RowText
                                        title={p.title}
                                        href={`/admin/projects/${p.id}/edit`}
                                        badges={
                                            <>
                                                <StatusBadge tone={published ? "success" : "neutral"}>{published ? "Published" : "Draft"}</StatusBadge>
                                                {p.featured ? <StatusBadge tone="info">Featured</StatusBadge> : null}
                                            </>
                                        }
                                        meta={[CATEGORY_LABEL[p.category] ?? p.category, `${formatNumber(p.view_count)} views`]}
                                    />
                                </HStack>
                                <RowActions>
                                    <RowIconButton
                                        label={p.featured ? "Unfeature" : "Feature"}
                                        pressed={p.featured}
                                        icon={<LuStar fill={p.featured ? "currentColor" : "none"} />}
                                        onClick={() => toggleFeature(p)}
                                        loading={action === "feature"}
                                        disabled={!!action}
                                    />
                                    <RowIconButton
                                        label={published ? "Unpublish" : "Publish"}
                                        icon={published ? <LuEyeOff /> : <LuEye />}
                                        onClick={() => togglePublish(p)}
                                        loading={action === "publish"}
                                        disabled={!!action}
                                    />
                                    <RowIconLink label="Edit" icon={<LuPencil />} href={`/admin/projects/${p.id}/edit`} disabled={!!action} />
                                    <RowIconButton label="Delete" tone="danger" icon={<LuTrash2 />} onClick={() => confirmDelete.ask(p)} disabled={!!action} />
                                </RowActions>
                            </ListRow>
                        );
                    })}
                </ListPanel>
            )}

            <ConfirmDialog
                open={confirmDelete.open}
                title="Delete project?"
                description={confirmDelete.target ? `"${confirmDelete.target.title}" will be deleted. This can't be undone.` : undefined}
                confirmLabel="Delete project"
                pending={confirmDelete.pending}
                error={confirmDelete.error}
                onConfirm={remove}
                onCancel={confirmDelete.cancel}
            />
        </>
    );
}
