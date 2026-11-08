"use client";

import { useState } from "react";
import { Box, Flex, Grid, Skeleton, Text } from "@chakra-ui/react";
import { MetricCard } from "@/components/admin/MetricCard";
import { DashboardChart } from "@/components/admin/DashboardChart";
import { FilterTabs, PageHeader, Panel, PanelNote, RatingStars, SectionTitle } from "@/components/admin/AdminUI";
import {
    formatDecimal,
    formatDuration,
    formatNumber,
    formatPercentChange,
    utcDateDaysAgo,
} from "@/components/admin/format";
import { ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import type { AnalyticsOverview, DashboardData, RatingsBreakdown, TopProject } from "@/lib/api";

const DASH = "—";

const RANGES = [
    { value: 7, label: "7 days" },
    { value: 30, label: "30 days" },
    { value: 90, label: "3 months" },
];

const DEVICE_LABEL: Record<string, string> = {
    desktop: "Desktop",
    mobile: "Mobile",
    tablet: "Tablet",
    bot: "Bot",
    unknown: "Unknown",
};

interface BarRow {
    key: string;
    label: string;
    sub?: string;
    value: number;
}

interface CardState {
    loading: boolean;
    error?: Error;
    retrying: boolean;
    onRetry: () => void;
}

/** Ranked list with thin bars (top pages, projects, devices). */
function BarListCard({ title, rows, emptyText, state }: { title: string; rows: BarRow[]; emptyText: string; state: CardState }) {
    const max = Math.max(1, ...rows.map((r) => r.value));
    return (
        <Panel h="full">
            <SectionTitle title={title} />
            {state.loading ? (
                <Flex direction="column" gap={5} aria-hidden>
                    {Array.from({ length: 4 }, (_, i) => (
                        <Box key={i}>
                            <Flex justify="space-between" mb={2}>
                                <Skeleton h={3.5} w="50%" rounded="sm" />
                                <Skeleton h={3.5} w={8} rounded="sm" />
                            </Flex>
                            <Skeleton h={1.5} w="full" rounded="md" />
                        </Box>
                    ))}
                </Flex>
            ) : state.error ? (
                <PanelNote error title="Couldn't load this" description={errorMessage(state.error)} onRetry={state.onRetry} retrying={state.retrying} />
            ) : rows.length === 0 ? (
                <PanelNote title="Nothing yet" description={emptyText} />
            ) : (
                <Box as="ol" listStyleType="none" display="flex" flexDirection="column" gap={4}>
                    {rows.map((r) => (
                        <Box as="li" key={r.key}>
                            <Flex justify="space-between" align="flex-end" gap={3} mb={1.5}>
                                <Box minW={0}>
                                    <Text fontSize="sm" fontWeight={500} color="text.primary" truncate>
                                        {r.label}
                                    </Text>
                                    {r.sub ? (
                                        <Text fontSize="xs" color="text.secondary" truncate>
                                            {r.sub}
                                        </Text>
                                    ) : null}
                                </Box>
                                <Text fontSize="sm" fontWeight={500} color="text.primary" flexShrink={0} fontVariantNumeric="tabular-nums">
                                    {formatNumber(r.value)}
                                </Text>
                            </Flex>
                            <Box w="full" h={1.5} bg="gray.100" rounded="md" overflow="hidden" aria-hidden>
                                <Box h="full" bg="primary.500" rounded="md" w={`${Math.max(2, (r.value / max) * 100)}%`} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Panel>
    );
}

/** Average rating and per-star distribution. */
function RatingsCard({ data, state }: { data?: RatingsBreakdown; state: CardState }) {
    const total = data?.total_testimonials ?? 0;
    const dist = data?.rating_distribution ?? {};
    return (
        <Panel h="full">
            <SectionTitle
                title="Testimonial ratings"
                description="Published testimonials, all time"
                actions={
                    data && total > 0 ? (
                        <Box textAlign="right" flexShrink={0}>
                            <Text fontSize="lg" fontWeight={600} color="text.primary" lineHeight="1.2" fontVariantNumeric="tabular-nums">
                                {formatDecimal(data.average_rating)}
                            </Text>
                            <Text textStyle="meta" color="text.secondary">
                                avg of {formatNumber(total)}
                            </Text>
                        </Box>
                    ) : null
                }
            />
            {state.loading ? (
                <Flex direction="column" gap={3} aria-hidden>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Skeleton key={i} h={3} w="full" rounded="sm" />
                    ))}
                </Flex>
            ) : state.error ? (
                <PanelNote error title="Couldn't load this" description={errorMessage(state.error)} onRetry={state.onRetry} retrying={state.retrying} />
            ) : total === 0 ? (
                <PanelNote title="No ratings yet" description="Approved testimonials show up here." />
            ) : (
                <Box as="ul" listStyleType="none" display="flex" flexDirection="column" gap={3}>
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = dist[String(star)] ?? 0;
                        const pct = (count / total) * 100;
                        return (
                            <Flex as="li" key={star} align="center" gap={3}>
                                <Box w="76px" flexShrink={0}>
                                    <RatingStars rating={star} />
                                </Box>
                                <Box flex={1} h={1.5} bg="gray.100" rounded="md" overflow="hidden" aria-hidden>
                                    <Box h="full" bg="primary.500" rounded="md" w={`${pct}%`} />
                                </Box>
                                <Text fontSize="sm" color="text.secondary" w={8} textAlign="right" flexShrink={0} fontVariantNumeric="tabular-nums">
                                    {formatNumber(count)}
                                </Text>
                            </Flex>
                        );
                    })}
                </Box>
            )}
        </Panel>
    );
}

export default function AdminAnalyticsPage() {
    // The start date for top projects is fixed when the range is picked, so
    // render stays pure and the request path is stable.
    const [range, setRange] = useState(() => ({ days: 30, start: utcDateDaysAgo(30) }));
    const { days } = range;

    const overview = useApi<AnalyticsOverview>(`/analytics/overview?days=${days}`);
    const dashboard = useApi<DashboardData>(`/analytics/dashboard?days=${days}`);
    const top = useApi<TopProject[]>(`/analytics/projects/top?limit=5&start_date=${range.start}`);
    const ratings = useApi<RatingsBreakdown>("/analytics/testimonials/ratings");

    const cardState = (q: { loading: boolean; error?: Error; refreshing: boolean; reload: () => void }): CardState => ({
        loading: q.loading,
        error: q.error,
        retrying: q.refreshing,
        onRetry: q.reload,
    });

    const allFailed = !!(overview.error && dashboard.error && top.error && ratings.error);
    const retryAll = () => {
        overview.reload();
        dashboard.reload();
        top.reload();
        ratings.reload();
    };

    const ov = overview.data;
    const m = dashboard.data?.metrics;

    const pageRows: BarRow[] = (ov?.top_pages ?? []).map((p) => ({ key: p.path, label: p.path, value: p.views }));
    const projectRows: BarRow[] = (top.data ?? []).map((p) => ({
        key: String(p.project_id),
        label: p.title,
        sub: `/projects/${p.slug}`,
        value: p.views,
    }));
    const deviceRows: BarRow[] = Object.entries(ov?.views_by_device ?? {})
        .sort((a, b) => b[1] - a[1])
        .map(([device, count]) => ({ key: device, label: DEVICE_LABEL[device] ?? device, value: count }));

    return (
        <Box>
            <PageHeader
                title="Analytics"
                description="Traffic and engagement across your portfolio"
                actions={
                    <FilterTabs
                        label="Date range"
                        options={RANGES}
                        value={days}
                        onChange={(d) => setRange({ days: d, start: utcDateDaysAgo(d) })}
                        mb={0}
                    />
                }
            />

            {allFailed ? (
                <ErrorState
                    title="Couldn't load analytics"
                    description={errorMessage(overview.error)}
                    onRetry={retryAll}
                    retrying={overview.refreshing}
                />
            ) : (
                <>
                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={4} mb={6}>
                        <MetricCard
                            label="Page views"
                            loading={dashboard.loading}
                            value={m ? formatNumber(m.total_views) : DASH}
                            change={m ? formatPercentChange(m.views_trend) : undefined}
                            hint={m ? `vs previous ${days} days` : dashboard.error ? "Couldn't load" : undefined}
                        />
                        <MetricCard
                            label="Unique visitors"
                            loading={overview.loading}
                            value={ov ? formatNumber(ov.unique_visitors) : DASH}
                            change={ov ? formatPercentChange(ov.visitors_trend) : undefined}
                            hint={ov ? `vs previous ${days} days` : overview.error ? "Couldn't load" : undefined}
                        />
                        <MetricCard
                            label="Avg. time on page"
                            loading={dashboard.loading}
                            value={m ? formatDuration(m.avg_session_seconds) : DASH}
                            hint={m ? "All time" : dashboard.error ? "Couldn't load" : undefined}
                        />
                        <MetricCard
                            label="Unread inquiries"
                            loading={overview.loading}
                            value={ov ? formatNumber(ov.contact_messages_count) : DASH}
                            hint={ov ? "All time" : overview.error ? "Couldn't load" : undefined}
                        />
                    </Grid>

                    <Grid templateColumns="repeat(12, 1fr)" gap={6} mb={6}>
                        <Box gridColumn={{ base: "span 12", lg: "span 8" }} minW={0}>
                            {dashboard.error && !dashboard.data ? (
                                <ErrorState
                                    title="Couldn't load views"
                                    description={errorMessage(dashboard.error)}
                                    onRetry={dashboard.reload}
                                    retrying={dashboard.refreshing}
                                />
                            ) : (
                                <DashboardChart
                                    dailyViews={dashboard.data?.daily_views ?? []}
                                    periodDays={dashboard.data?.period_days ?? days}
                                    loading={dashboard.loading}
                                />
                            )}
                        </Box>
                        <Box gridColumn={{ base: "span 12", lg: "span 4" }} minW={0}>
                            <BarListCard title="Top pages" rows={pageRows} emptyText="No page views recorded in this period." state={cardState(overview)} />
                        </Box>
                    </Grid>

                    <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={6}>
                        <BarListCard title="Top projects" rows={projectRows} emptyText="No project views in this period." state={cardState(top)} />
                        <BarListCard title="Traffic by device" rows={deviceRows} emptyText="No device data in this period." state={cardState(overview)} />
                        <RatingsCard data={ratings.data} state={cardState(ratings)} />
                    </Grid>
                </>
            )}
        </Box>
    );
}
