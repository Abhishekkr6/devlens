"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    GitCommit,
    GitPullRequest,
    Users,
    Sparkles,
    Lock,
    ShieldAlert
} from "lucide-react";
import { motion } from "motion/react";
import { api } from "../../../lib/api";
import { useLiveStore } from "../../../store/liveStore";
import { useUserStore } from "../../../store/userStore";
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
    const [errorType, setErrorType] = useState<"404" | "generic" | null>(null);

    const lastEvent = useLiveStore((state) => state.lastEvent);
    const { user } = useUserStore();

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
            value: user?.plan === "free" ? "🔒" : (riskBuckets[2]?.count ?? 0),
            icon: AlertCircle,
            trend: null,
            helper: user?.plan === "free" ? "Available on Pro Plan" : "High-risk pull requests",
        },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-6 sm:space-y-8"
        >
            <header>
                <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary"
                >
                    Overview
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-2 text-sm sm:text-base text-text-secondary font-light"
                >
                    Real-time team activity and metrics for your organization
                </motion.p>
            </header>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ label, value, icon: Icon, trend, helper }, index) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 + (index * 0.05), ease: [0.23, 1, 0.32, 1] }}
                        key={label}
                    >
                        <Card className="rounded-2xl border border-white/10 bg-surface/50 backdrop-blur-xl p-5 sm:p-6 shadow-lg hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)] transition-all duration-300 relative group overflow-hidden h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-text-secondary">
                                            {label}
                                        </p>
                                        <p className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">{value}</p>
                                    </div>
                                    <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand shadow-inner">
                                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </span>
                                </div>
                                {trend !== null ? (
                                    <span className={`mt-4 sm:mt-5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-bold shadow-sm border ${trend >= 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                        }`}>
                                        {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                        {Math.abs(trend).toFixed(1)}% {trend >= 0 ? "increase" : "decrease"}
                                    </span>
                                ) : <p className="mt-4 sm:mt-5 text-[10px] sm:text-xs text-text-secondary font-medium">{helper}</p>}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </section>

            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
                <Card className="lg:col-span-2 rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary">Weekly Activity</h2>
                            <p className="text-sm text-text-secondary font-light">Commit trend for the past month</p>
                        </div>
                    </div>
                    <div className="h-56 sm:h-72 relative z-10">
                        {timeline.length === 0 ? (
                            <div className="flex h-full items-center justify-center rounded-2xl bg-surface/50 border border-dashed border-border text-sm text-text-secondary">
                                No activity recorded.
                            </div>
                        ) : (
                            <CommitLineChart data={timeline.map(t => ({ _id: t.date, total: t.count }))} />
                        )}
                    </div>
                </Card>

                <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-colors duration-300 flex flex-col">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary">PR Status</h2>
                        <a
                            href={`/organization/${orgId}/prs`}
                            className="p-2.5 bg-brand/10 hover:bg-brand/20 border border-brand/20 rounded-xl transition-all group-hover:shadow-[0_0_15px_rgba(74,93,255,0.2)] cursor-pointer active:scale-95"
                            title="View PRs with AI Analysis"
                        >
                            <Sparkles className="w-5 h-5 text-brand group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                    <ul className="space-y-3 relative z-10 flex-1">
                        {[{ label: "Open", value: prStatusCounts.open }, { label: "Review", value: prStatusCounts.review }, { label: "Merged", value: prStatusCounts.merged }].map((item) => (
                            <li key={item.label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-surface/40 hover:bg-surface/80 hover:border-white/10 transition-colors px-4 py-3.5">
                                <span className="text-sm font-medium text-text-secondary">{item.label}</span>
                                <span className="text-lg font-bold text-text-primary">{item.value}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-400 flex items-center gap-2 relative z-10">
                        <Activity className="w-4 h-4" /> Average merge time is {data.kpis.avgPRTimeHours}h.
                    </div>
                </Card>
            </motion.section>

            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
                <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-colors duration-300">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mb-6 flex items-center gap-3 relative z-10">
                        PR Risk Distribution
                        {user?.plan === "free" && (
                            <span className="bg-orange-500/10 text-orange-400 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-orange-500/20 shadow-sm">
                                <Lock className="w-3 h-3" /> Pro
                            </span>
                        )}
                    </h2>
                    
                    <div className={`relative z-10 h-64 ${user?.plan === "free" ? "filter blur-[6px] opacity-30 select-none pointer-events-none" : ""}`}>
                         <PRRiskBarChart data={user?.plan === "free" ? [{label: "0-30", count: 8}, {label: "30-70", count: 3}, {label: "70-100", count: 1}] : riskBuckets} />
                    </div>

                    {user?.plan === "free" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px] z-20 p-6 text-center border-t border-white/5">
                            <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20 mb-4 shadow-[0_0_30px_rgba(249,115,22,0.15)]">
                                <ShieldAlert className="w-10 h-10 text-orange-400" />
                            </div>
                            <h3 className="font-bold text-text-primary text-lg mb-2 tracking-tight">High-Risk Detection Locked</h3>
                            <p className="text-sm text-text-secondary mb-6 max-w-[260px] font-light leading-relaxed">Upgrade to accurately detect and block risky code before it breaks production.</p>
                            <a href="/pricing" className="bg-text-primary text-background hover:bg-slate-200 text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95">
                                Upgrade to Pro
                            </a>
                        </div>
                    )}
                </Card>

                <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-colors duration-300 flex flex-col">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mb-6 relative z-10">Top Contributors</h2>
                    <div className="space-y-3 relative z-10 flex-1">
                        {data.charts.contributorBreakdown.map((c, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 hover:bg-white/[0.02] px-2 -mx-2 rounded-lg transition-colors">
                                <span className="text-sm font-medium text-text-secondary">{c.name}</span>
                                <span className="text-sm font-bold text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20 shadow-sm">{c.commits} commits</span>
                            </div>
                        ))}
                        {data.charts.contributorBreakdown.length === 0 && (
                            <p className="text-sm text-text-secondary 1lex items-center justify-center h-full">No contributor data</p>
                        )}
                    </div>
                </Card>
            </motion.section>
        </motion.div>
    );
}
