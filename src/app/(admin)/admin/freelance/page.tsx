"use client";

import Link from "next/link";
import { Button, Grid, HStack, NativeSelect } from "@chakra-ui/react";
import { LuBriefcase, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
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
    controlProps,
    primaryButton,
    type BadgeTone,
} from "@/components/admin/AdminUI";
import { MetricCard } from "@/components/admin/MetricCard";
import { countLabel, dropItem, patchItem, useConfirmAction, useRowPending } from "@/components/admin/hooks";
import { formatMoney, formatNumber } from "@/components/admin/format";
import { FREELANCE_STATUSES, PRICING_TYPES } from "@/components/admin/FreelanceForm";
import { EmptyState, ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { api, type FreelanceStats, type FreelanceStatus, type FreelanceWork, type Paginated } from "@/lib/api";

const LIST_PATH = "/freelance/?page_size=100";
const STATS_PATH = "/freelance/stats";

const STATUS_TONE: Record<FreelanceStatus, BadgeTone> = {
    active: "success",
    paused: "warning",
    discontinued: "neutral",
};
const STATUS_LABEL: Record<string, string> = Object.fromEntries(FREELANCE_STATUSES.map((s) => [s.value, s.label]));
const PRICING_LABEL: Record<string, string> = Object.fromEntries(PRICING_TYPES.map((p) => [p.value, p.label]));

function NewServiceButton() {
    return (
        <Button asChild size="sm" {...primaryButton}>
            <Link href="/admin/freelance/create">
                <LuPlus aria-hidden /> New service
            </Link>
        </Button>
    );
}

export default function AdminFreelanceListPage() {
    const list = useApi<Paginated<FreelanceWork>>(LIST_PATH);
    const stats = useApi<FreelanceStats>(STATS_PATH);
    const { data, error, loading, refreshing, reload, setData } = list;
    const { pendingAction, run } = useRowPending();
    const confirmDelete = useConfirmAction<FreelanceWork>();

    const refreshAll = () => {
        reload();
        stats.reload();
    };

    const changeStatus = (f: FreelanceWork, next: FreelanceStatus) => {
        if (next === f.status) return;
        void run(f.id, "status", async () => {
            try {
                const res = await api.patch<{ id: number; status: FreelanceStatus }>(`/freelance/${f.id}/status?new_status=${next}`);
                setData((prev) => patchItem(prev, f.id, (item) => ({ ...item, status: res.status })));
                toast.success(`Status set to ${(STATUS_LABEL[res.status] ?? res.status).toLowerCase()}`);
            } catch (err) {
                toast.error(errorMessage(err, "Couldn't update the status."));
            } finally {
                refreshAll();
            }
        });
    };

    const remove = () =>
        confirmDelete.confirm(async (f) => {
            await api.del(`/freelance/${f.id}`);
            setData((prev) => dropItem(prev, f.id));
            toast.success("Service deleted");
            refreshAll();
        });

    const items = data?.items ?? [];
    const s = stats.data;

    return (
        <>
            <PageHeader
                title="Freelance"
                description={data ? countLabel(data.total, "service") : "Services offered on the public freelance page"}
                actions={<NewServiceButton />}
            />

            {stats.error && !s ? null : (
                <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", xl: "repeat(5, 1fr)" }} gap={4} mb={6}>
                    <MetricCard label="Total" loading={stats.loading} value={s ? formatNumber(s.total_projects) : "—"} />
                    <MetricCard label="Active" loading={stats.loading} value={s ? formatNumber(s.active_projects) : "—"} />
                    <MetricCard label="Paused" loading={stats.loading} value={s ? formatNumber(s.on_hold_projects) : "—"} />
                    <MetricCard label="Discontinued" loading={stats.loading} value={s ? formatNumber(s.completed_projects) : "—"} />
                    <MetricCard label="Public" loading={stats.loading} value={s ? formatNumber(s.public_projects) : "—"} />
                </Grid>
            )}

            {error && !data ? (
                <ErrorState title="Couldn't load freelance services" description={errorMessage(error)} onRetry={reload} retrying={refreshing} />
            ) : loading ? (
                <ListSkeleton media actions={3} label="Loading freelance services" />
            ) : items.length === 0 ? (
                <EmptyState
                    icon={<LuBriefcase />}
                    title="No freelance services yet"
                    description="Add a service with its pricing, deliverables and delivery time."
                    action={<NewServiceButton />}
                />
            ) : (
                <ListPanel label="Freelance services">
                    {items.map((f) => {
                        const action = pendingAction(f.id);
                        return (
                            <ListRow key={f.id} aria-busy={!!action}>
                                <HStack gap={4} flex={1} minW={0}>
                                    <RowMedia>
                                        <LuBriefcase aria-hidden />
                                    </RowMedia>
                                    <RowText
                                        title={f.title}
                                        href={`/admin/freelance/${f.id}/edit`}
                                        badges={
                                            <>
                                                <StatusBadge tone={STATUS_TONE[f.status] ?? "neutral"}>{STATUS_LABEL[f.status] ?? f.status}</StatusBadge>
                                                {f.featured ? <StatusBadge tone="info">Featured</StatusBadge> : null}
                                            </>
                                        }
                                        meta={[
                                            formatMoney(f.base_price, f.currency),
                                            PRICING_LABEL[f.pricing_type] ?? f.pricing_type,
                                            countLabel(f.inquiry_count, "inquiry", "inquiries"),
                                        ]}
                                    />
                                </HStack>
                                <RowActions>
                                    <NativeSelect.Root size="sm" w="36" disabled={!!action}>
                                        <NativeSelect.Field
                                            aria-label={`Status for ${f.title}`}
                                            value={f.status}
                                            onChange={(e) => changeStatus(f, e.target.value as FreelanceStatus)}
                                            cursor="pointer"
                                            {...controlProps}
                                        >
                                            {FREELANCE_STATUSES.map((st) => (
                                                <option key={st.value} value={st.value}>
                                                    {st.label}
                                                </option>
                                            ))}
                                        </NativeSelect.Field>
                                        <NativeSelect.Indicator color="text.secondary" />
                                    </NativeSelect.Root>
                                    <RowIconLink label="Edit" icon={<LuPencil />} href={`/admin/freelance/${f.id}/edit`} disabled={!!action} />
                                    <RowIconButton label="Delete" tone="danger" icon={<LuTrash2 />} onClick={() => confirmDelete.ask(f)} disabled={!!action} />
                                </RowActions>
                            </ListRow>
                        );
                    })}
                </ListPanel>
            )}

            <ConfirmDialog
                open={confirmDelete.open}
                title="Delete service?"
                description={confirmDelete.target ? `"${confirmDelete.target.title}" will be removed from the freelance page. This can't be undone.` : undefined}
                confirmLabel="Delete service"
                pending={confirmDelete.pending}
                error={confirmDelete.error}
                onConfirm={remove}
                onCancel={confirmDelete.cancel}
            />
        </>
    );
}
