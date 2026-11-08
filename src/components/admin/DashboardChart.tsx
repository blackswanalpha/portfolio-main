"use client";

import { Box, Flex, Skeleton, Text, VisuallyHidden } from "@chakra-ui/react";
import { useMemo } from "react";
import type { DailyViewPoint } from "@/lib/api";
import { Panel, SectionTitle } from "./AdminUI";
import { formatCalendarShort, formatNumber, utcDateDaysAgo } from "./format";
import { useMinuteClock } from "./hooks";

// SVG coordinate space. The SVG stretches to the box (preserveAspectRatio
// "none"), so y positions map linearly to the box height and the HTML axis
// labels can be placed by percentage. Strokes use non-scaling-stroke.
const VIEW_W = 800;
const VIEW_H = 240;
const PLOT_TOP = 8;
const PLOT_BOTTOM = 232;
const INTERVALS = 3;
const X_LABELS = 6;

/** Round the axis step up to 1, 2 or 5 times a power of ten. */
function niceStep(max: number): number {
    const raw = Math.max(1, max) / INTERVALS;
    const pow = 10 ** Math.floor(Math.log10(raw));
    const n = raw / pow;
    const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
    return Math.max(1, Math.ceil(step));
}

/**
 * The backend only returns days that had views. Fill the whole window
 * (start = today - period, inclusive, matching the backend) with zeros so the
 * x axis is real time, not "days with traffic".
 */
function fillSeries(points: DailyViewPoint[], periodDays: number, now: number): DailyViewPoint[] {
    const byDate = new Map(points.map((p) => [p.date, p.views]));
    if (now > 0) {
        const today = new Date(now);
        for (let i = periodDays; i >= 0; i--) {
            const d = utcDateDaysAgo(i, today);
            if (!byDate.has(d)) byDate.set(d, 0);
        }
    }
    return [...byDate.entries()]
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([date, views]) => ({ date, views }));
}

export function DashboardChart({
    dailyViews,
    periodDays,
    loading = false,
}: {
    dailyViews: DailyViewPoint[];
    periodDays: number;
    loading?: boolean;
}) {
    const now = useMinuteClock();

    const chart = useMemo(() => {
        const pts = fillSeries(dailyViews, periodDays, now);
        const total = pts.reduce((sum, p) => sum + p.views, 0);
        const peak = pts.reduce((best, p) => (p.views > best.views ? p : best), { date: "", views: 0 });
        const step = niceStep(peak.views);
        const top = step * INTERVALS;
        const y = (v: number) => PLOT_TOP + (1 - v / top) * (PLOT_BOTTOM - PLOT_TOP);
        const x = (i: number) => (pts.length <= 1 ? VIEW_W / 2 : (i * VIEW_W) / (pts.length - 1));
        const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.views).toFixed(1)}`).join(" ");
        const area = pts.length
            ? `${line} L${x(pts.length - 1).toFixed(1)},${PLOT_BOTTOM} L${x(0).toFixed(1)},${PLOT_BOTTOM} Z`
            : "";
        const ticks = Array.from({ length: INTERVALS + 1 }, (_, i) => ({ value: step * (INTERVALS - i), y: y(step * (INTERVALS - i)) }));
        const labels: string[] = [];
        if (pts.length > 0) {
            const count = Math.min(X_LABELS, pts.length);
            for (let i = 0; i < count; i++) {
                const idx = count === 1 ? 0 : Math.round((i * (pts.length - 1)) / (count - 1));
                labels.push(pts[idx].date);
            }
        }
        return { pts, total, peak, line, area, ticks, labels };
    }, [dailyViews, periodDays, now]);

    const hasViews = chart.total > 0;
    const first = chart.pts[0]?.date;
    const last = chart.pts[chart.pts.length - 1]?.date;

    return (
        <Panel>
            <SectionTitle
                title="Portfolio views"
                description={`Views per day, last ${periodDays} days`}
                actions={
                    loading ? (
                        <Skeleton h={6} w={20} rounded="sm" />
                    ) : (
                        <Box textAlign="right" flexShrink={0}>
                            <Text fontSize="lg" fontWeight={600} color="text.primary" fontVariantNumeric="tabular-nums" lineHeight="1.2">
                                {formatNumber(chart.total)}
                            </Text>
                            <Text textStyle="meta" color="text.secondary">
                                total views
                            </Text>
                        </Box>
                    )
                }
            />

            {loading ? (
                <Skeleton h="60" rounded="lg" />
            ) : (
                <Box>
                    <Flex gap={3}>
                        {/* Y axis */}
                        <Box position="relative" w={8} flexShrink={0} h="56" aria-hidden>
                            {chart.ticks.map((t) => (
                                <Text
                                    key={t.value}
                                    position="absolute"
                                    right={0}
                                    top={`${(t.y / VIEW_H) * 100}%`}
                                    transform="translateY(-50%)"
                                    fontSize="xs"
                                    color="text.secondary"
                                    fontVariantNumeric="tabular-nums"
                                >
                                    {formatNumber(t.value)}
                                </Text>
                            ))}
                        </Box>

                        <Box position="relative" flex={1} minW={0} h="56">
                            <svg
                                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                                preserveAspectRatio="none"
                                width="100%"
                                height="100%"
                                aria-hidden
                                style={{ display: "block", overflow: "visible" }}
                            >
                                {chart.ticks.map((t) => (
                                    <line
                                        key={t.value}
                                        x1={0}
                                        x2={VIEW_W}
                                        y1={t.y}
                                        y2={t.y}
                                        stroke="var(--chakra-colors-gray-200)"
                                        strokeWidth={1}
                                        vectorEffect="non-scaling-stroke"
                                    />
                                ))}
                                {hasViews ? (
                                    <>
                                        <path d={chart.area} fill="var(--chakra-colors-primary-500)" fillOpacity={0.08} />
                                        <path
                                            d={chart.line}
                                            fill="none"
                                            stroke="var(--chakra-colors-primary-500)"
                                            strokeWidth={2}
                                            strokeLinejoin="round"
                                            strokeLinecap="round"
                                            vectorEffect="non-scaling-stroke"
                                        />
                                    </>
                                ) : null}
                            </svg>
                            {!hasViews ? (
                                <Flex position="absolute" inset={0} align="center" justify="center">
                                    <Text fontSize="sm" color="text.secondary" bg="surface" px={2}>
                                        No views in this period
                                    </Text>
                                </Flex>
                            ) : null}
                        </Box>
                    </Flex>

                    {/* X axis */}
                    <Flex justify="space-between" mt={2} pl={11} aria-hidden>
                        {chart.labels.map((d, i) => (
                            <Text key={`${d}-${i}`} fontSize="xs" color="text.secondary" fontVariantNumeric="tabular-nums">
                                {formatCalendarShort(d)}
                            </Text>
                        ))}
                    </Flex>

                    <VisuallyHidden>
                        {hasViews
                            ? `${formatNumber(chart.total)} views from ${formatCalendarShort(first)} to ${formatCalendarShort(last)}. Busiest day ${formatCalendarShort(chart.peak.date)} with ${formatNumber(chart.peak.views)} views.`
                            : `No views from ${formatCalendarShort(first)} to ${formatCalendarShort(last)}.`}
                    </VisuallyHidden>
                </Box>
            )}
        </Panel>
    );
}
