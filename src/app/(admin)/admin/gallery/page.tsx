"use client";

import Link from "next/link";
import { Button, HStack, Image } from "@chakra-ui/react";
import { LuEye, LuEyeOff, LuImage, LuMusic, LuPencil, LuPlus, LuTrash2, LuVideo } from "react-icons/lu";
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
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { api, mediaUrl, type GalleryItem, type Paginated } from "@/lib/api";

const LIST_PATH = "/gallery/?published_only=false&page_size=100";

const TYPE_ICON = { image: LuImage, video: LuVideo, audio: LuMusic } as const;
const TYPE_LABEL = { image: "Image", video: "Video", audio: "Audio" } as const;

function NewItemButton() {
    return (
        <Button asChild size="sm" {...primaryButton}>
            <Link href="/admin/gallery/create">
                <LuPlus aria-hidden /> New item
            </Link>
        </Button>
    );
}

export default function AdminGalleryListPage() {
    const { data, error, loading, refreshing, reload, setData } = useApi<Paginated<GalleryItem>>(LIST_PATH);
    const { pendingAction, run } = useRowPending();
    const confirmDelete = useConfirmAction<GalleryItem>();

    const togglePublish = (item: GalleryItem) =>
        run(item.id, "publish", async () => {
            const next = !item.is_published;
            try {
                const res = await api.patch<{ id: number; is_published: boolean }>(`/gallery/${item.id}/publish?publish=${next}`);
                setData((prev) => patchItem(prev, item.id, (g) => ({ ...g, is_published: res.is_published })));
                toast.success(res.is_published ? "Item published" : "Item moved to drafts");
            } catch (err) {
                toast.error(errorMessage(err, "Couldn't update the item."));
            } finally {
                reload();
            }
        });

    const remove = () =>
        confirmDelete.confirm(async (item) => {
            await api.del(`/gallery/${item.id}`);
            setData((prev) => dropItem(prev, item.id));
            toast.success("Item deleted");
            reload();
        });

    const items = data?.items ?? [];

    return (
        <>
            <PageHeader
                title="Gallery"
                description={data ? countLabel(data.total, "item") : "Art, video and music for the public gallery"}
                actions={<NewItemButton />}
            />

            {error && !data ? (
                <ErrorState title="Couldn't load the gallery" description={errorMessage(error)} onRetry={reload} retrying={refreshing} />
            ) : loading ? (
                <ListSkeleton media actions={3} label="Loading gallery items" />
            ) : items.length === 0 ? (
                <EmptyState
                    icon={<LuImage />}
                    title="No gallery items yet"
                    description="Upload art, video or music, then publish it to show it in the public gallery."
                    action={<NewItemButton />}
                />
            ) : (
                <ListPanel label="Gallery items">
                    {items.map((item) => {
                        const action = pendingAction(item.id);
                        const TypeIcon = TYPE_ICON[item.media_type] ?? LuImage;
                        const thumb = item.media_type === "image" ? item.media_url : item.thumbnail_url;
                        return (
                            <ListRow key={item.id} aria-busy={!!action}>
                                <HStack gap={4} flex={1} minW={0}>
                                    <RowMedia>
                                        {thumb ? (
                                            <Image src={mediaUrl(thumb)} alt="" w="full" h="full" objectFit="cover" />
                                        ) : (
                                            <TypeIcon aria-hidden />
                                        )}
                                    </RowMedia>
                                    <RowText
                                        title={item.title}
                                        href={`/admin/gallery/${item.id}/edit`}
                                        badges={
                                            <StatusBadge tone={item.is_published ? "success" : "neutral"}>
                                                {item.is_published ? "Published" : "Draft"}
                                            </StatusBadge>
                                        }
                                        meta={[TYPE_LABEL[item.media_type] ?? item.media_type, item.category]}
                                    />
                                </HStack>
                                <RowActions>
                                    <RowIconButton
                                        label={item.is_published ? "Unpublish" : "Publish"}
                                        icon={item.is_published ? <LuEyeOff /> : <LuEye />}
                                        onClick={() => togglePublish(item)}
                                        loading={action === "publish"}
                                        disabled={!!action}
                                    />
                                    <RowIconLink label="Edit" icon={<LuPencil />} href={`/admin/gallery/${item.id}/edit`} disabled={!!action} />
                                    <RowIconButton label="Delete" tone="danger" icon={<LuTrash2 />} onClick={() => confirmDelete.ask(item)} disabled={!!action} />
                                </RowActions>
                            </ListRow>
                        );
                    })}
                </ListPanel>
            )}

            <ConfirmDialog
                open={confirmDelete.open}
                title="Delete gallery item?"
                description={confirmDelete.target ? `"${confirmDelete.target.title}" will be removed from the gallery. This can't be undone.` : undefined}
                confirmLabel="Delete item"
                pending={confirmDelete.pending}
                error={confirmDelete.error}
                onConfirm={remove}
                onCancel={confirmDelete.cancel}
            />
        </>
    );
}
