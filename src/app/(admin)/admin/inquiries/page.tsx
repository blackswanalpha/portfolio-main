"use client";

import { useEffect, useRef, useState } from "react";
import { LuArchive, LuInbox, LuMailOpen, LuTrash2, LuTriangleAlert } from "react-icons/lu";
import toast from "react-hot-toast";
import {
    ConfirmDialog,
    FilterTabs,
    ListPanel,
    ListRow,
    ListSkeleton,
    PageHeader,
    RowActions,
    RowIconButton,
    RowText,
    StatusBadge,
    type BadgeTone,
} from "@/components/admin/AdminUI";
import { countLabel, dropItem, patchItem, useConfirmAction, useRowPending } from "@/components/admin/hooks";
import { formatDate } from "@/components/admin/format";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { api, type InquiryListItem, type InquiryStatus, type Paginated } from "@/lib/api";
import { INQUIRY_STATUS_LABEL, INQUIRY_STATUS_TONE, REASON_LABEL } from "./labels";

type Filter = "" | InquiryStatus;

const FILTERS: { value: Filter; label: string }[] = [
    { value: "", label: "All" },
    { value: "new", label: "New" },
    { value: "read", label: "Read" },
    { value: "replied", label: "Replied" },
    { value: "archived", label: "Archived" },
    { value: "spam", label: "Spam" },
];

const EMPTY_COPY: Record<Filter, { title: string; description: string }> = {
    "": { title: "No inquiries yet", description: "Messages sent through the contact form on your portfolio show up here." },
    new: { title: "No new inquiries", description: "Unread messages from the contact form show up here." },
    read: { title: "No read inquiries", description: "Messages you've opened but not archived show up here." },
    replied: { title: "No replied inquiries", description: "Messages marked as replied show up here." },
    archived: { title: "No archived inquiries", description: "Archive a message to move it out of the inbox." },
    spam: { title: "No spam", description: "Messages flagged as spam show up here." },
};

export default function AdminInquiriesListPage() {
    const [filter, setFilter] = useState<Filter>("");
    const filterRef = useRef<Filter>(filter);
    useEffect(() => {
        filterRef.current = filter;
    }, [filter]);

    const path = `/contact/?page_size=100${filter ? `&status=${filter}` : ""}`;
    const { data, error, loading, refreshing, reload, setData } = useApi<Paginated<InquiryListItem>>(path, { revalidateOnFocus: true });
    const { pendingAction, run } = useRowPending();
    const confirmDelete = useConfirmAction<InquiryListItem>();

    /** Apply a status change; drop the row if it no longer matches the active filter. */
    const applyStatus = (id: number, status: InquiryStatus) => {
        const current = filterRef.current;
        setData((prev) => (current && status !== current ? dropItem(prev, id) : patchItem(prev, id, (item) => ({ ...item, status }))));
    };

    const markRead = (item: InquiryListItem) =>
        run(item.id, "read", async () => {
            try {
                const res = await api.patch<{ id: number; status: InquiryStatus }>(`/contact/${item.id}/read`);
                applyStatus(item.id, res.status);
                toast.success("Marked as read");
            } catch (err) {
                toast.error(errorMessage(err, "Couldn't mark the message as read."));
            } finally {
                reload();
            }
        });

    const archive = (item: InquiryListItem) =>
        run(item.id, "archive", async () => {
            try {
                const res = await api.patch<{ id: number; status: InquiryStatus }>(`/contact/${item.id}/archive`);
                applyStatus(item.id, res.status);
                toast.success("Inquiry archived");
            } catch (err) {
                toast.error(errorMessage(err, "Couldn't archive the message."));
            } finally {
                reload();
            }
        });

    const remove = () =>
        confirmDelete.confirm(async (item) => {
            await api.del(`/contact/${item.id}`);
            setData((prev) => dropItem(prev, item.id));
            toast.success("Inquiry deleted");
            reload();
        });

    const items = data?.items ?? [];
    const empty = EMPTY_COPY[filter];

    return (
        <>
            <PageHeader
                title="Inquiries"
                description={data ? countLabel(data.total, filter ? `${INQUIRY_STATUS_LABEL[filter].toLowerCase()} message` : "message") : "Messages from the contact form"}
            />

            <FilterTabs label="Filter by status" options={FILTERS} value={filter} onChange={setFilter} />

            {error && !data ? (
                <ErrorState title="Couldn't load inquiries" description={errorMessage(error)} onRetry={reload} retrying={refreshing} />
            ) : loading ? (
                <ListSkeleton actions={3} label="Loading inquiries" />
            ) : items.length === 0 ? (
                <EmptyState icon={<LuInbox />} title={empty.title} description={empty.description} />
            ) : (
                <ListPanel label="Inquiries">
                    {items.map((item) => {
                        const action = pendingAction(item.id);
                        return (
                            <ListRow key={item.id} aria-busy={!!action}>
                                <RowText
                                    title={item.subject}
                                    href={`/admin/inquiries/${item.id}`}
                                    badges={
                                        <>
                                            <StatusBadge tone={INQUIRY_STATUS_TONE[item.status] ?? ("neutral" as BadgeTone)}>
                                                {INQUIRY_STATUS_LABEL[item.status] ?? item.status}
                                            </StatusBadge>
                                            {item.is_spam && item.status !== "spam" ? (
                                                <StatusBadge tone="danger">
                                                    <LuTriangleAlert aria-hidden /> Spam
                                                </StatusBadge>
                                            ) : null}
                                        </>
                                    }
                                    preview={item.message_preview}
                                    meta={[item.name, item.email, REASON_LABEL[item.contact_reason] ?? item.contact_reason, formatDate(item.created_at)]}
                                />
                                <RowActions>
                                    {item.status === "new" ? (
                                        <RowIconButton
                                            label="Mark as read"
                                            icon={<LuMailOpen />}
                                            onClick={() => markRead(item)}
                                            loading={action === "read"}
                                            disabled={!!action}
                                        />
                                    ) : null}
                                    {item.status !== "archived" ? (
                                        <RowIconButton
                                            label="Archive"
                                            icon={<LuArchive />}
                                            onClick={() => archive(item)}
                                            loading={action === "archive"}
                                            disabled={!!action}
                                        />
                                    ) : null}
                                    <RowIconButton label="Delete" tone="danger" icon={<LuTrash2 />} onClick={() => confirmDelete.ask(item)} disabled={!!action} />
                                </RowActions>
                            </ListRow>
                        );
                    })}
                </ListPanel>
            )}

            <ConfirmDialog
                open={confirmDelete.open}
                title="Delete message?"
                description={confirmDelete.target ? `The message from ${confirmDelete.target.name} will be deleted. This can't be undone.` : undefined}
                confirmLabel="Delete message"
                pending={confirmDelete.pending}
                error={confirmDelete.error}
                onConfirm={remove}
                onCancel={confirmDelete.cancel}
            />
        </>
    );
}
