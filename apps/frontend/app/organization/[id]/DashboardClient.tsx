"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    GitCommit,
    GitPullRequest,
    Users,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useLiveStore } from "../../../store/liveStore";
import { Card } from "../../../components/Ui/Card";
import CommitLineChart from "../../../components/Charts/CommitLineChart";
import PRRiskBarChart from "../../../components/Charts/PRRiskBarChart";

interface DashboardData {
    kpis: {
        commits: number;
        activeDevs: number;
        openPRs: number;
        avgPRTimeHours: number;
    };
    charts: {
        commitTimeline: { date: string; commitCount: number }[];
        prVelocity: { date: string; opened: number; merged: number }[];
        contributorBreakdown: { name: string; commits: number }[];
    };
}

type TimelineEntry = {
    date: string;
    count: number;
};

type RiskBucket = { label: string; count: number };

type PRStatusSummary = {
    open: number;
    review: number;
    merged: number;
};

const emptyStatus: PRStatusSummary = { open: 0, review: 0, merged: 0 };

export default function DashboardClient({ orgId }: { orgId: string }) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [riskBuckets, setRiskBuckets] = useState<RiskBucket[]>([]);
    const [prStatusCounts, setPrStatusCounts] = useState<PRStatusSummary>(emptyStatus);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(0);

    const lastEvent = useLiveStore((state) => state.lastEvent);

    const loadData = useCallback(async () => {
        if (!orgId) return;
        try {
            setLoading(true);

            const [dashRes, timelineRes, prsRes] = await Promise.all([
                api.get(`/orgs/${orgId}/dashboard`),
                api.get(`/orgs/${orgId}/activity/commits`),
                api.get(`/orgs/${orgId}/prs`),
            ]);

            setData(dashRes.data?.data ?? null);

            const timelineData = Array.isArray(timelineRes.data?.data)
                ? timelineRes.data.data.map((d: any) => ({ date: d._id, count: d.total }))
                : [];
            setTimeline(timelineData);

            const prs = prsRes.data?.data?.items || [];
            const buckets: RiskBucket[] = [
                { label: "0–30", count: 0 },
                { label: "30–70", count: 0 },
                { label: "70–100", count: 0 },
            ];

            const statusSummary: PRStatusSummary = { ...emptyStatus };

            prs.forEach((p: any) => {
                const r = p.riskScore || 0;
                const normalized = r <= 1 ? r * 100 : r;

                if (normalized < 30) buckets[0].count += 1;
                else if (normalized < 70) buckets[1].count += 1;
                else buckets[2].count += 1;

                const state = (p.state || "").toLowerCase();
                if (state === "open") statusSummary.open += 1;
                else if (state === "merged") statusSummary.merged += 1;
                else statusSummary.review += 1;
            });

            setRiskBuckets(buckets);
            setPrStatusCounts(statusSummary);
        } catch (e: unknown) {
            console.error("Dashboard load error:", e);
        } finally {
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!orgId || !lastEvent) return;
        if (lastEvent.type !== "PR_UPDATED" && lastEvent.type !== "NEW_ALERT" && lastEvent.type !== "COMMIT_PROCESSED") return;

        const now = Date.now();
        if (now - lastRefresh < 5000) return;

        loadData();
        setLastRefresh(now);
    }, [lastEvent, lastRefresh, loadData, orgId]);

    const commitTrend = useMemo(() => {
        if (!timeline.length) return null;
        const recent = timeline.slice(-14);
        if (recent.length < 14) return null;

        const previousSeven = recent.slice(0, 7);
        const latestSeven = recent.slice(7);

        const previousTotal = previousSeven.reduce((sum, entry) => sum + (entry.count || 0), 0);
        const latestTotal = latestSeven.reduce((sum, entry) => sum + (entry.count || 0), 0);

        if (!previousTotal) return null;

        return ((latestTotal - previousTotal) / previousTotal) * 100;
    }, [timeline]);

    if (loading || !data) {
        return <div className="p-8 text-center text-text-secondary">Loading dashboard...</div>;
    }

    const statCards = [
        {
            label: "Weekly Commits",
            value: data.kpis.commits,
            icon: GitCommit,
            trend: commitTrend,
            helper: "Activity captured from the last 7 days",
        },
        {
            label: "Open PRs",
            value: data.kpis.openPRs,
            icon: GitPullRequest,
            trend: null,
            helper: "Awaiting review or merge",
        },
        {
            label: "Team Members",
            value: data.kpis.activeDevs,
            icon: Users,
            trend: null,
            helper: "Active contributors this week",
        },
        {
            label: "Critical Alerts",
            value: riskBuckets[2]?.count ?? 0,
            icon: AlertCircle,
            trend: null,
            helper: "High-risk pull requests",
        },
    ];

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-semibold text-text-primary">Overview</h1>
                <p className="mt-1 text-sm text-text-secondary">Real-time team activity and metrics for your organization</p>
            </header>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ label, value, icon: Icon, trend, helper }) => (
                    <Card key={label} className="rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                    {label}
                                </p>
                                <p className="mt-3 text-3xl font-semibold text-text-primary">{value}</p>
                            </div>
                            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-brand/20 text-brand dark:text-indigo-400">
                                <Icon className="h-5 w-5" />
                            </span>
                        </div>
                        {trend !== null ? (
                            <span className={`mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trend >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                                }`}>
                                {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                {Math.abs(trend).toFixed(1)}% {trend >= 0 ? "increase" : "decrease"}
                            </span>
                        ) : <p className="mt-4 text-xs text-text-secondary">{helper}</p>}
                    </Card>
                ))
                }
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 rounded-2xl border border-border bg-background p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Weekly Activity</h2>
                            <p className="text-sm text-text-secondary">Commit trend for the past month</p>
                        </div>
                    </div>
                    <div className="h-64">
                        {timeline.length === 0 ? (
                            <div className="flex h-full items-center justify-center rounded-xl bg-surface text-sm text-text-secondary">
                                No activity recorded.
                            </div>
                        ) : (
                            <CommitLineChart data={timeline.map(t => ({ _id: t.date, total: t.count }))} />
                        )}
                    </div>
                </Card>

                <Card className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-text-primary mb-6">PR Status</h2>
                    <ul className="space-y-4">
                        {[{ label: "Open", value: prStatusCounts.open }, { label: "Review", value: prStatusCounts.review }, { label: "Merged", value: prStatusCounts.merged }].map((item) => (
                            <li key={item.label} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                                <span className="text-sm font-medium text-text-secondary">{item.label}</span>
                                <span className="text-lg font-semibold text-text-primary">{item.value}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 text-xs text-indigo-700 dark:text-indigo-400">
                        Average merge time is {data.kpis.avgPRTimeHours}h.
                    </div>
                </Card>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-text-primary mb-6">PR Risk Distribution</h2>
                    <PRRiskBarChart data={riskBuckets} />
                </Card>

                <Card className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Top Contributors</h2>
                    <div className="space-y-4">
                        {data.charts.contributorBreakdown.map((c, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                                <span className="text-sm font-medium text-text-secondary">{c.name}</span>
                                <span className="text-sm font-bold text-brand dark:text-indigo-400">{c.commits} commits</span>
                            </div>
                        ))}
                        {data.charts.contributorBreakdown.length === 0 && (
                            <p className="text-sm text-text-secondary">No contributor data</p>
                        )}
                    </div>
                </Card>
            </section>
        </div>
    );
}
