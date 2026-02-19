"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    GitCommit,
    GitPullRequest,
    Users,
    Sparkles,
} from "lucide-react";
import { api } from "../../../lib/api";
import { useLiveStore } from "../../../store/liveStore";
import { Card } from "../../../components/Ui/Card";
import { AIStatsWidget } from "../../../components/Ui/AIStatsWidget";
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
    const [errorType, setErrorType] = useState<"404" | "generic" | null>(null);

    const lastEvent = useLiveStore((state) => state.lastEvent);

    const retryRef = useRef(0);
    const [errorMessage, setErrorMessage] = useState("");
    const loadDataRef = useRef<() => void>(() => { });

    const loadData = useCallback(async (isBackgroundPoll = false) => {
        if (!orgId) return;

        try {
            if (!isBackgroundPoll) {
                setLoading(true);
            }

            const [dashRes, timelineRes, prsRes] = await Promise.all([
                api.get(`/orgs/${orgId}/dashboard`),
                api.get(`/orgs/${orgId}/activity/commits`),
                api.get(`/orgs/${orgId}/prs`),
            ]);

            setData(dashRes.data?.data ?? null);

            const timelineData = Array.isArray(timelineRes.data?.data)
                ? timelineRes.data.data.map((d: { _id: string; total: number }) => ({ date: d._id, count: d.total }))
                : [];
            setTimeline(timelineData);

            const prs = prsRes.data?.data?.items || [];
            const buckets: RiskBucket[] = [
                { label: "0–30", count: 0 },
                { label: "30–70", count: 0 },
                { label: "70–100", count: 0 },
            ];

            const statusSummary: PRStatusSummary = { ...emptyStatus };

            prs.forEach((p: { riskScore?: number; state?: string }) => {
                const r = p.riskScore || 0;
                const normalized = r <= 1 ? r * 100 : r;

                if (normalized < 30) buckets[0].count += 1;
                else if (normalized < 70) buckets[1].count += 1;
                else buckets[2].count += 1;

                const state = (p.state || "").toLowerCase();
                if (state === "open") statusSummary.open += 1;
                else if (state === "merged") statusSummary.merged += 1;
                else if (state === "review") statusSummary.review += 1;
            });

            setRiskBuckets(buckets);
            setPrStatusCounts(statusSummary);
            setErrorType(null);
            setLoading(false);
        } catch (err: unknown) {
            console.error("Dashboard load error:", err);
            const e = err as { response?: { data?: { error?: { message?: string } }, status?: number }, message?: string };
            const msg = e.response?.data?.error?.message || e.message || "Unknown error";

            if (retryRef.current < 1) {

                retryRef.current += 1;
                setTimeout(() => {
                    loadDataRef.current();
                }, 1000);
                return;
            }

            setErrorMessage(msg);
            if (e.response?.status === 404) {
                setErrorType("404");
            } else {
                setErrorType("generic");
            }
            setLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        loadDataRef.current = loadData;
    }, [loadData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!orgId) return;

        const pollInterval = setInterval(() => {
            loadData(true);
        }, 30000);

        return () => clearInterval(pollInterval);
    }, [orgId, loadData]);

    useEffect(() => {
        if (!orgId || !lastEvent) return;
        if (lastEvent.type !== "PR_UPDATED" && lastEvent.type !== "NEW_ALERT" && lastEvent.type !== "COMMIT_PROCESSED" && lastEvent.type !== "org:joined") return;

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

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    <p className="text-xs sm:text-sm text-text-secondary animate-pulse">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data || errorType) {
        if (errorType === "404") {
            return (
                <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-center">
                    <div className="rounded-full bg-surface p-4 border border-border">
                        <Users className="h-8 w-8 text-text-secondary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Organization Not Found</h3>
                        <p className="text-sm text-text-secondary">This organization may have been deleted or you don't have access.</p>
                    </div>
                    <a
                        href="/organization"
                        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
                    >
                        Go to My Organizations
                    </a>
                </div>
            );
        }

        return (
            <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-surface p-4 border border-border">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-text-primary">Failed to load dashboard</h3>
                    <p className="text-sm text-text-secondary">{errorMessage || "Something went wrong while fetching data."}</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-surface border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface/80 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
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
        <div className="space-y-4 sm:space-y-6">
            <header>
                <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">Overview</h1>
                <p className="mt-1 text-xs sm:text-sm text-text-secondary">Real-time team activity and metrics for your organization</p>
            </header>

            <section className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ label, value, icon: Icon, trend, helper }) => (
                    <Card key={label} className="rounded-xl sm:rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                    {label}
                                </p>
                                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold text-text-primary">{value}</p>
                            </div>
                            <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-black/10 dark:bg-slate-900 border border-border/50 dark:border-white/10 text-brand dark:text-white">
                                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </span>
                        </div>
                        {trend !== null ? (
                            <span className={`mt-3 sm:mt-4 inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold ${trend >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                                }`}>
                                {trend >= 0 ? <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                                {Math.abs(trend).toFixed(1)}% {trend >= 0 ? "increase" : "decrease"}
                            </span>
                        ) : <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-text-secondary">{helper}</p>}
                    </Card>
                ))
                }
            </section>

            <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 rounded-xl sm:rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-text-primary">Weekly Activity</h2>
                            <p className="text-xs sm:text-sm text-text-secondary">Commit trend for the past month</p>
                        </div>
                    </div>
                    <div className="h-48 sm:h-64">
                        {timeline.length === 0 ? (
                            <div className="flex h-full items-center justify-center rounded-xl bg-surface text-xs sm:text-sm text-text-secondary">
                                No activity recorded.
                            </div>
                        ) : (
                            <CommitLineChart data={timeline.map(t => ({ _id: t.date, total: t.count }))} />
                        )}
                    </div>
                </Card>

                <Card className="rounded-xl sm:rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-base sm:text-lg font-semibold text-text-primary">PR Status</h2>
                        <a
                            href={`/organization/${orgId}/prs`}
                            className="p-2 hover:bg-surface rounded-lg transition-colors group cursor-pointer"
                            title="View PRs with AI Analysis"
                        >
                            <Sparkles className="w-5 h-5 text-brand group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                    <ul className="space-y-3 sm:space-y-4">
                        {[{ label: "Open", value: prStatusCounts.open }, { label: "Review", value: prStatusCounts.review }, { label: "Merged", value: prStatusCounts.merged }].map((item) => (
                            <li key={item.label} className="flex items-center justify-between rounded-lg sm:rounded-xl border border-border bg-surface px-3 sm:px-4 py-2 sm:py-3">
                                <span className="text-xs sm:text-sm font-medium text-text-secondary">{item.label}</span>
                                <span className="text-base sm:text-lg font-semibold text-text-primary">{item.value}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 sm:mt-6 rounded-lg sm:rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20 px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs text-indigo-700 dark:text-indigo-400">
                        Average merge time is {data.kpis.avgPRTimeHours}h.
                    </div>
                </Card>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                <Card className="rounded-xl sm:rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
                    <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-4 sm:mb-6">PR Risk Distribution</h2>
                    <PRRiskBarChart data={riskBuckets} />
                </Card>

                <Card className="rounded-xl sm:rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
                    <h2 className="text-base sm:text-lg font-semibold text-text-primary mb-3 sm:mb-4">Top Contributors</h2>
                    <div className="space-y-3 sm:space-y-4">
                        {data.charts.contributorBreakdown.map((c, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                                <span className="text-xs sm:text-sm font-medium text-text-secondary">{c.name}</span>
                                <span className="text-xs sm:text-sm font-bold text-brand dark:text-indigo-400">{c.commits} commits</span>
                            </div>
                        ))}
                        {data.charts.contributorBreakdown.length === 0 && (
                            <p className="text-xs sm:text-sm text-text-secondary">No contributor data</p>
                        )}
                    </div>
                </Card>
            </section>
        </div>
    );
}
