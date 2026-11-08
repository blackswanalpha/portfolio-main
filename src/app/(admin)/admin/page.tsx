"use client";

import { Box, Flex, Grid } from "@chakra-ui/react";
import { MetricCard } from "@/components/admin/MetricCard";
import { DashboardChart } from "@/components/admin/DashboardChart";
import { QuickActions } from "@/components/admin/QuickActions";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { PageHeader } from "@/components/admin/AdminUI";
import { formatDuration, formatNumber, formatPercentChange } from "@/components/admin/format";
import { ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import type { DashboardData } from "@/lib/api";

const DAYS = 30;
const DASH = "—";

function newInPeriod(n: number): string {
    return n > 0 ? `+${formatNumber(n)} in the last ${DAYS} days` : `None new in the last ${DAYS} days`;
}

export default function AdminDashboardPage() {
    const { data, error, loading, refreshing, reload } = useApi<DashboardData>(`/analytics/dashboard?days=${DAYS}`);
    const m = data?.metrics;
    const period = data?.period_days ?? DAYS;

    return (
        <>
            <PageHeader title="Dashboard" description={`Your portfolio over the last ${DAYS} days`} />

            {error && !data ? (
                <Flex direction="column" gap={6}>
                    <ErrorState title="Couldn't load the dashboard" description={errorMessage(error)} onRetry={reload} retrying={refreshing} />
                    <Box maxW={{ base: "full", lg: "sm" }}>
                        <QuickActions />
                    </Box>
                </Flex>
            ) : (
                <>
                    <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(5, 1fr)" }} gap={4} mb={6}>
                        <MetricCard
                            label="Projects"
                            loading={loading}
                            value={m ? formatNumber(m.projects_count) : DASH}
                            hint={m ? newInPeriod(m.projects_new_in_period) : undefined}
                        />
                        <MetricCard
                            label="Active services"
                            loading={loading}
                            value={m ? formatNumber(m.freelance_active_count) : DASH}
                            hint={m ? `of ${formatNumber(m.freelance_total)} freelance services` : undefined}
                        />
                        <MetricCard
                            label="Views"
                            loading={loading}
                            value={m ? formatNumber(m.total_views) : DASH}
                            change={m ? formatPercentChange(m.views_trend) : undefined}
                            hint={m ? `vs previous ${DAYS} days` : undefined}
                        />
                        <MetricCard
                            label="Testimonials"
                            loading={loading}
                            value={m ? formatNumber(m.testimonials_count) : DASH}
                            hint={m ? newInPeriod(m.testimonials_new_in_period) : undefined}
                        />
                        <MetricCard
                            label="Avg. time on page"
                            loading={loading}
                            value={m ? formatDuration(m.avg_session_seconds) : DASH}
                            hint={m ? "All time" : undefined}
                        />
                    </Grid>

                    <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                        <Box gridColumn={{ base: "span 12", lg: "span 8" }} minW={0}>
                            <DashboardChart dailyViews={data?.daily_views ?? []} periodDays={period} loading={loading} />
                        </Box>
                        <Flex direction="column" gap={6} gridColumn={{ base: "span 12", lg: "span 4" }} minW={0}>
                            <QuickActions />
                            <ActivityFeed items={data?.activity ?? []} loading={loading} />
                        </Flex>
                    </Grid>
                </>
            )}
        </>
    );
}
