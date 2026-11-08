"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@chakra-ui/react";
import { LuCheck, LuMessageSquareQuote, LuPencil, LuPlus, LuStar, LuTrash2, LuX } from "react-icons/lu";
import toast from "react-hot-toast";
import {
    ConfirmDialog,
    FilterTabs,
    ListPanel,
    ListRow,
    ListSkeleton,
    PageHeader,
    RatingStars,
    RowActions,
    RowIconButton,
    RowIconLink,
    RowText,
    StatusBadge,
    primaryButton,
    type BadgeTone,
} from "@/components/admin/AdminUI";
import { countLabel, dropItem, patchItem, useConfirmAction, useRowPending } from "@/components/admin/hooks";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { api, type Paginated, type Testimonial, type TestimonialStatus } from "@/lib/api";
import { useTestimonialBadge } from "@/store/testimonialBadge";

type Filter = "" | TestimonialStatus;

// The backend also has a "hidden" status; it gets a neutral fallback badge.
const STATUS_TONE: Record<string, BadgeTone> = { pending: "warning", approved: "success", rejected: "danger", hidden: "neutral" };
const STATUS_LABEL: Record<string, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected", hidden: "Hidden" };

const FILTERS: { value: Filter; label: string }[] = [
    { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

const EMPTY_COPY: Partial<Record<Filter, { title: string; description: string }>> & Record<"", { title: string; description: string }> = {
    "": { title: "No testimonials yet", description: "Add one yourself. Testimonials submitted on the public site wait here for approval." },
    pending: { title: "Nothing waiting for review", description: "New testimonials from clients show up here until you approve or reject them." },
    approved: { title: "No approved testimonials", description: "Approved testimonials can appear on the public site." },
    rejected: { title: "No rejected testimonials", description: "Testimonials you reject are kept here." },
};

function NewTestimonialButton() {
    return (
        <Button asChild size="sm" {...primaryButton}>
            <Link href="/admin/testimonials/create">
                <LuPlus aria-hidden /> New testimonial
            </Link>
        </Button>
    );
}

const refreshBadge = () => void useTestimonialBadge.getState().refresh();

export default function AdminTestimonialsListPage() {
    const [filter, setFilter] = useState<Filter>("");
    const filterRef = useRef<Filter>(filter);
    useEffect(() => {
        filterRef.current = filter;
    }, [filter]);

    const path = `/testimonials/admin?page_size=100${filter ? `&status=${filter}` : ""}`;
    const { data, error, loading, refreshing, reload, setData } = useApi<Paginated<Testimonial>>(path);
    const { pendingAction, run } = useRowPending();
    const confirmDelete = useConfirmAction<Testimonial>();

    /** Apply a status change; drop the row if it no longer matches the active filter. */
    const applyStatus = (updated: Testimonial) => {
        const current = filterRef.current;
        setData((prev) =>
            current && updated.status !== current ? dropItem(prev, updated.id) : patchItem(prev, updated.id, () => updated),
        );
    };

    const setStatus = (t: Testimonial, verb: "approve" | "reject") =>
        run(t.id, verb, async () => {
            try {
                const updated = await api.patch<Testimonial>(`/testimonials/${t.id}/${verb}`);
                applyStatus(updated);
                toast.success(verb === "approve" ? "Testimonial approved" : "Testimonial rejected");
                refreshBadge();
            } catch (err) {
                toast.error(errorMessage(err, `Couldn't ${verb} the testimonial.`));
            } finally {
                reload();
            }
        });

    const toggleFeature = (t: Testimonial) =>
        run(t.id, "feature", async () => {
            try {
                const res = await api.patch<{ id: number; is_featured: boolean }>(`/testimonials/${t.id}/feature`);
                setData((prev) => patchItem(prev, t.id, (item) => ({ ...item, is_featured: res.is_featured })));
                toast.success(res.is_featured ? "Testimonial featured" : "Testimonial unfeatured");
            } catch (err) {
                toast.error(errorMessage(err, "Couldn't update the testimonial."));
            } finally {
                reload();
            }
        });

    const remove = () =>
        confirmDelete.confirm(async (t) => {
            await api.del(`/testimonials/${t.id}`);
            setData((prev) => dropItem(prev, t.id));
            toast.success("Testimonial deleted");
            refreshBadge();
            reload();
        });

    const items = data?.items ?? [];
    const empty = EMPTY_COPY[filter] ?? EMPTY_COPY[""];

    return (
        <>
            <PageHeader
                title="Testimonials"
                description={data ? countLabel(data.total, filter ? `${STATUS_LABEL[filter].toLowerCase()} testimonial` : "testimonial") : "Client reviews and their approval status"}
                actions={<NewTestimonialButton />}
            />

            <FilterTabs label="Filter by status" options={FILTERS} value={filter} onChange={setFilter} />

            {error && !data ? (
                <ErrorState title="Couldn't load testimonials" description={errorMessage(error)} onRetry={reload} retrying={refreshing} />
            ) : loading ? (
                <ListSkeleton actions={5} label="Loading testimonials" />
            ) : items.length === 0 ? (
                <EmptyState icon={<LuMessageSquareQuote />} title={empty.title} description={empty.description} action={<NewTestimonialButton />} />
            ) : (
                <ListPanel label="Testimonials">
                    {items.map((t) => {
                        const action = pendingAction(t.id);
                        const role = [t.client_position, t.client_company].filter(Boolean).join(", ");
                        return (
                            <ListRow key={t.id} aria-busy={!!action}>
                                <RowText
                                    title={t.client_name}
                                    href={`/admin/testimonials/${t.id}/edit`}
                                    badges={
                                        <>
                                            <StatusBadge tone={STATUS_TONE[t.status] ?? "neutral"}>{STATUS_LABEL[t.status] ?? t.status}</StatusBadge>
                                            {t.is_featured ? <StatusBadge tone="info">Featured</StatusBadge> : null}
                                        </>
                                    }
                                    preview={t.content}
                                    meta={[<RatingStars key="rating" rating={t.rating} />, role]}
                                />
                                <RowActions>
                                    {t.status !== "approved" ? (
                                        <RowIconButton
                                            label="Approve"
                                            icon={<LuCheck />}
                                            onClick={() => setStatus(t, "approve")}
                                            loading={action === "approve"}
                                            disabled={!!action}
                                        />
                                    ) : null}
                                    {t.status !== "rejected" ? (
                                        <RowIconButton
                                            label="Reject"
                                            icon={<LuX />}
                                            onClick={() => setStatus(t, "reject")}
                                            loading={action === "reject"}
                                            disabled={!!action}
                                        />
                                    ) : null}
                                    <RowIconButton
                                        label={t.is_featured ? "Unfeature" : "Feature"}
                                        pressed={t.is_featured}
                                        icon={<LuStar fill={t.is_featured ? "currentColor" : "none"} />}
                                        onClick={() => toggleFeature(t)}
                                        loading={action === "feature"}
                                        disabled={!!action}
                                    />
                                    <RowIconLink label="Edit" icon={<LuPencil />} href={`/admin/testimonials/${t.id}/edit`} disabled={!!action} />
                                    <RowIconButton label="Delete" tone="danger" icon={<LuTrash2 />} onClick={() => confirmDelete.ask(t)} disabled={!!action} />
                                </RowActions>
                            </ListRow>
                        );
                    })}
                </ListPanel>
            )}

            <ConfirmDialog
                open={confirmDelete.open}
                title="Delete testimonial?"
                description={confirmDelete.target ? `The testimonial from ${confirmDelete.target.client_name} will be removed. This can't be undone.` : undefined}
                confirmLabel="Delete testimonial"
                pending={confirmDelete.pending}
                error={confirmDelete.error}
                onConfirm={remove}
                onCancel={confirmDelete.cancel}
            />
        </>
    );
}
