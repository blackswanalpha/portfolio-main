"use client";

import Link from "next/link";
import { Button } from "@chakra-ui/react";
import { LuEye, LuEyeOff, LuFileText, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
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
import { formatDate, formatNumber } from "@/components/admin/format";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { api, type BlogPost, type Paginated } from "@/lib/api";

const BLOG_LIST_PATH = "/blog/?published_only=false&page_size=100";

function NewPostButton() {
    return (
        <Button asChild size="sm" {...primaryButton}>
            <Link href="/admin/blog/create">
                <LuPlus aria-hidden /> New article
            </Link>
        </Button>
    );
}

export default function AdminBlogListPage() {
    const { data, error, loading, refreshing, reload, setData } = useApi<Paginated<BlogPost>>(BLOG_LIST_PATH);
    const { pendingAction, run } = useRowPending();
    const confirmDelete = useConfirmAction<BlogPost>();

    const togglePublish = (post: BlogPost) =>
        run(post.id, "publish", async () => {
            const next = !post.is_published;
            try {
                const res = await api.patch<{ id: number; is_published: boolean }>(`/blog/${post.id}/publish?publish=${next}`);
                setData((prev) => patchItem(prev, post.id, (item) => ({ ...item, is_published: res.is_published })));
                toast.success(res.is_published ? "Article published" : "Article moved to drafts");
            } catch (err) {
                toast.error(errorMessage(err, "Couldn't update the article."));
            } finally {
                // Publishing also sets published_at; pull the full record.
                reload();
            }
        });

    const remove = () =>
        confirmDelete.confirm(async (post) => {
            await api.del(`/blog/${post.id}`);
            setData((prev) => dropItem(prev, post.id));
            toast.success("Article deleted");
            reload();
        });

    const posts = data?.items ?? [];

    return (
        <>
            <PageHeader
                title="Blog"
                description={data ? countLabel(data.total, "article") : "Articles for the public blog"}
                actions={<NewPostButton />}
            />

            {error && !data ? (
                <ErrorState title="Couldn't load articles" description={errorMessage(error)} onRetry={reload} retrying={refreshing} />
            ) : loading ? (
                <ListSkeleton actions={3} label="Loading articles" />
            ) : posts.length === 0 ? (
                <EmptyState
                    icon={<LuFileText />}
                    title="No articles yet"
                    description="Write an article in Markdown, then publish it to show it on the public blog."
                    action={<NewPostButton />}
                />
            ) : (
                <ListPanel label="Articles">
                    {posts.map((post) => {
                        const action = pendingAction(post.id);
                        return (
                            <ListRow key={post.id} aria-busy={!!action}>
                                <RowText
                                    title={post.title}
                                    href={`/admin/blog/${post.id}/edit`}
                                    badges={
                                        <StatusBadge tone={post.is_published ? "success" : "neutral"}>
                                            {post.is_published ? "Published" : "Draft"}
                                        </StatusBadge>
                                    }
                                    meta={[
                                        `/${post.slug}`,
                                        formatDate(post.published_at || post.created_at),
                                        `${formatNumber(post.view_count)} views`,
                                    ]}
                                />
                                <RowActions>
                                    <RowIconButton
                                        label={post.is_published ? "Unpublish" : "Publish"}
                                        icon={post.is_published ? <LuEyeOff /> : <LuEye />}
                                        onClick={() => togglePublish(post)}
                                        loading={action === "publish"}
                                        disabled={!!action}
                                    />
                                    <RowIconLink label="Edit" icon={<LuPencil />} href={`/admin/blog/${post.id}/edit`} disabled={!!action} />
                                    <RowIconButton label="Delete" tone="danger" icon={<LuTrash2 />} onClick={() => confirmDelete.ask(post)} disabled={!!action} />
                                </RowActions>
                            </ListRow>
                        );
                    })}
                </ListPanel>
            )}

            <ConfirmDialog
                open={confirmDelete.open}
                title="Delete article?"
                description={confirmDelete.target ? `"${confirmDelete.target.title}" will be removed from the blog. This can't be undone.` : undefined}
                confirmLabel="Delete article"
                pending={confirmDelete.pending}
                error={confirmDelete.error}
                onConfirm={remove}
                onCancel={confirmDelete.cancel}
            />
        </>
    );
}
