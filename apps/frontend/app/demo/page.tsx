"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    GitCommit,
    GitPullRequest,
    Users,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Github,
    ShieldAlert,
    CheckCircle2,
    Clock,
    BarChart3,
    Activity,
    Menu,
    X,
} from "lucide-react";

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_KPIs = {
    commits: 142,
    openPRs: 11,
    teamMembers: 7,
    criticalAlerts: 3,
};

const COMMIT_TREND = 18.4; // % increase

const MOCK_COMMIT_TIMELINE = [
    { date: "Feb 3", count: 8 },
    { date: "Feb 4", count: 12 },
    { date: "Feb 5", count: 5 },
    { date: "Feb 6", count: 19 },
    { date: "Feb 7", count: 14 },
    { date: "Feb 8", count: 3 },
    { date: "Feb 9", count: 2 },
    { date: "Feb 10", count: 22 },
    { date: "Feb 11", count: 17 },
    { date: "Feb 12", count: 9 },
    { date: "Feb 13", count: 24 },
    { date: "Feb 14", count: 13 },
    { date: "Feb 15", count: 6 },
    { date: "Feb 16", count: 4 },
    { date: "Feb 17", count: 21 },
    { date: "Feb 18", count: 18 },
    { date: "Feb 19", count: 11 },
    { date: "Feb 20", count: 28 },
    { date: "Feb 21", count: 16 },
    { date: "Feb 22", count: 7 },
    { date: "Feb 23", count: 5 },
    { date: "Feb 24", count: 31 },
    { date: "Feb 25", count: 25 },
    { date: "Feb 26", count: 20 },
    { date: "Feb 27", count: 14 },
    { date: "Feb 28", count: 9 },
    { date: "Mar 1", count: 33 },
    { date: "Mar 2", count: 27 },
];

const MOCK_PR_STATUS = { open: 11, review: 5, merged: 38 };

const MOCK_RISK_BUCKETS = [
    { label: "Low (0–30)", count: 21, color: "#10b981" },
    { label: "Med (30–70)", count: 14, color: "#f59e0b" },
    { label: "High (70–100)", count: 3, color: "#ef4444" },
];

const MOCK_CONTRIBUTORS = [
    { name: "sarah-dev", commits: 47, avatar: "https://i.pravatar.cc/40?u=sarah" },
    { name: "alex.xyz", commits: 31, avatar: "https://i.pravatar.cc/40?u=alex" },
    { name: "priya_codes", commits: 28, avatar: "https://i.pravatar.cc/40?u=priya" },
    { name: "marcus_w", commits: 22, avatar: "https://i.pravatar.cc/40?u=marcus" },
    { name: "elena.t", commits: 14, avatar: "https://i.pravatar.cc/40?u=elena" },
];

const MOCK_RECENT_PRS = [
    {
        id: 1,
        title: "feat: add WebSocket real-time notifications",
        author: "sarah-dev",
        risk: 82,
        state: "open",
        time: "2h ago",
    },
    {
        id: 2,
        title: "refactor: extract auth middleware",
        author: "alex.xyz",
        risk: 24,
        state: "merged",
        time: "5h ago",
    },
    {
        id: 3,
        title: "fix: race condition in commit processor",
        author: "priya_codes",
        risk: 61,
        state: "review",
        time: "8h ago",
    },
    {
        id: 4,
        title: "chore: upgrade Next.js to 15",
        author: "marcus_w",
        risk: 45,
        state: "review",
        time: "1d ago",
    },
    {
        id: 5,
        title: "docs: update API reference",
        author: "elena.t",
        risk: 12,
        state: "merged",
        time: "1d ago",
    },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function riskColor(score: number) {
    if (score >= 70) return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20";
    if (score >= 30) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
    return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
}

function stateColor(state: string) {
    if (state === "merged") return "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20";
    if (state === "review") return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20";
    return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20";
}

// ─── Mini Commit Line Chart (SVG-based, no deps) ─────────────────────────────

function MiniLineChart({ data }: { data: { date: string; count: number }[] }) {
    const max = Math.max(...data.map((d) => d.count), 1);
    const w = 600;
    const h = 120;
    const pad = 16;
    const points = data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - ((d.count / max) * (h - pad * 2));
        return `${x},${y}`;
    });

    const area = `M${points[0]} ${points.map((p) => `L${p}`).join(" ")} L${pad + (w - pad * 2)},${h - pad} L${pad},${h - pad} Z`;
    const line = `M${points.join(" L")}`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#commitGrad)" />
            <path d={line} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {data.map((d, i) => {
                if (i % 7 !== 0 && i !== data.length - 1) return null;
                const x = pad + (i / (data.length - 1)) * (w - pad * 2);
                const y = h - pad - ((d.count / max) * (h - pad * 2));
                return (
                    <circle key={i} cx={x} cy={y} r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
                );
            })}
        </svg>
    );
}

// ─── Mini Bar Chart ────────────────────────────────────────────────────────────

function MiniBarChart({ data }: { data: { label: string; count: number; color: string }[] }) {
    const max = Math.max(...data.map((d) => d.count), 1);
    return (
        <div className="flex items-end gap-4 h-32 w-full px-2">
            {data.map((d) => (
                <div key={d.label} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-xs font-bold text-text-primary">{d.count}</span>
                    <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                            height: `${(d.count / max) * 80}px`,
                            backgroundColor: d.color,
                            opacity: 0.85,
                        }}
                    />
                    <span className="text-[10px] text-text-secondary text-center leading-tight">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────

function DemoNav() {
    const [open, setOpen] = useState(false);
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50 py-3">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-1">
                    <img src="/logo.svg" alt="DevLens" className="w-10 h-10" />
                    <span className="text-xl font-bold tracking-tight text-text-primary" style={{ fontFamily: "var(--font-logo)" }}>
                        DevLens
                    </span>
                </Link>
                <div className="hidden md:flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <Activity className="w-3 h-3" />
                        Demo Mode — Mock Data
                    </span>
                    <Link
                        href="/"
                        className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                        ← Back to Home
                    </Link>
                    <a
                        href="/auth/github/login"
                        className="flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg"
                    >
                        <Github className="w-4 h-4" />
                        Start Free
                    </a>
                </div>
                <button className="md:hidden p-2 text-text-secondary" onClick={() => setOpen(!open)}>
                    {open ? <X /> : <Menu />}
                </button>
            </div>
            {open && (
                <div className="md:hidden border-t border-border/50 bg-background px-4 py-4 flex flex-col gap-3">
                    <Link href="/" className="text-sm font-medium text-text-secondary" onClick={() => setOpen(false)}>
                        ← Back to Home
                    </Link>
                    <a
                        href="/auth/github/login"
                        className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-lg text-sm font-semibold"
                    >
                        <Github className="w-4 h-4" />
                        Start Free
                    </a>
                </div>
            )}
        </nav>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DemoPage() {
    const statCards = [
        {
            label: "Weekly Commits",
            value: MOCK_KPIs.commits,
            icon: GitCommit,
            trend: COMMIT_TREND,
            helper: "Activity from the last 7 days",
        },
        {
            label: "Open PRs",
            value: MOCK_KPIs.openPRs,
            icon: GitPullRequest,
            trend: null,
            helper: "Awaiting review or merge",
        },
        {
            label: "Team Members",
            value: MOCK_KPIs.teamMembers,
            icon: Users,
            trend: null,
            helper: "Active contributors this week",
        },
        {
            label: "Critical Alerts",
            value: MOCK_KPIs.criticalAlerts,
            icon: AlertCircle,
            trend: null,
            helper: "High-risk pull requests",
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <DemoNav />

            {/* Hero banner */}
            <div className="pt-20 pb-0 bg-gradient-to-b from-indigo-50/60 dark:from-indigo-900/20 to-transparent border-b border-border/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800 mb-3">
                            <Sparkles className="w-3 h-3" />
                            Interactive Demo
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                            Acme Engineering · Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-text-secondary">
                            This is a live preview of your DevLens dashboard with realistic mock data.
                        </p>
                    </div>
                    <a
                        href="/auth/github/login"
                        className="flex-shrink-0 flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-xl hover:-translate-y-0.5"
                    >
                        <Github className="w-4 h-4" />
                        Connect Your Repo
                    </a>
                </div>
            </div>

            {/* Dashboard content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* KPI cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map(({ label, value, icon: Icon, trend, helper }) => (
                        <div key={label} className="rounded-2xl border border-border bg-background p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                                        {label}
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold text-text-primary">{value}</p>
                                </div>
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                                    <Icon className="h-5 w-5" />
                                </span>
                            </div>
                            {trend !== null ? (
                                <span
                                    className={`mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trend >= 0
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                                            : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                                        }`}
                                >
                                    {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                    {Math.abs(trend).toFixed(1)}% {trend >= 0 ? "increase" : "decrease"}
                                </span>
                            ) : (
                                <p className="mt-4 text-xs text-text-secondary">{helper}</p>
                            )}
                        </div>
                    ))}
                </section>

                {/* Charts row */}
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Commit chart */}
                    <div className="lg:col-span-2 rounded-2xl border border-border bg-background p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-text-primary">Weekly Activity</h2>
                                <p className="text-sm text-text-secondary">Commit trend for the past month</p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                <BarChart3 className="w-4 h-4" />
                                Live updates
                            </span>
                        </div>
                        <div className="h-[160px]">
                            <MiniLineChart data={MOCK_COMMIT_TIMELINE} />
                        </div>
                        <div className="mt-3 flex gap-4 text-xs text-text-secondary">
                            {MOCK_COMMIT_TIMELINE.slice(-4).map((d) => (
                                <span key={d.date} className="flex flex-col items-center gap-0.5">
                                    <span className="font-semibold text-text-primary">{d.count}</span>
                                    <span>{d.date}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* PR Status */}
                    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-text-primary">PR Status</h2>
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                        </div>
                        <ul className="space-y-3">
                            {[
                                { label: "Open", value: MOCK_PR_STATUS.open },
                                { label: "In Review", value: MOCK_PR_STATUS.review },
                                { label: "Merged", value: MOCK_PR_STATUS.merged },
                            ].map((item) => (
                                <li key={item.label} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                                    <span className="text-sm font-medium text-text-secondary">{item.label}</span>
                                    <span className="text-lg font-semibold text-text-primary">{item.value}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-5 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-3 text-xs text-indigo-700 dark:text-indigo-400">
                            Average merge time is <strong>4.2h</strong>.
                        </div>
                    </div>
                </section>

                {/* Bottom row */}
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Risk chart */}
                    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-text-primary">PR Risk Distribution</h2>
                                <p className="text-sm text-text-secondary">AI-scored pull requests by risk level</p>
                            </div>
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                        </div>
                        <MiniBarChart data={MOCK_RISK_BUCKETS} />
                    </div>

                    {/* Top contributors */}
                    <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-text-primary mb-5">Top Contributors</h2>
                        <div className="space-y-3">
                            {MOCK_CONTRIBUTORS.map((c, i) => {
                                const pct = Math.round((c.commits / MOCK_CONTRIBUTORS[0].commits) * 100);
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <img
                                            src={c.avatar}
                                            alt={c.name}
                                            className="w-8 h-8 rounded-full border-2 border-border object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-text-primary truncate">{c.name}</span>
                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 ml-2 flex-shrink-0">
                                                    {c.commits} commits
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-surface rounded-full">
                                                <div
                                                    className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Recent PRs */}
                <section className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Recent Pull Requests</h2>
                            <p className="text-sm text-text-secondary">AI-scored for risk and complexity</p>
                        </div>
                        <span className="text-xs text-text-secondary">AI Risk Score</span>
                    </div>
                    <div className="space-y-3">
                        {MOCK_RECENT_PRS.map((pr) => (
                            <div
                                key={pr.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{pr.title}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-text-secondary">@{pr.author}</span>
                                        <span className="flex items-center gap-1 text-xs text-text-secondary">
                                            <Clock className="w-3 h-3" />
                                            {pr.time}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${stateColor(pr.state)}`}>
                                        {pr.state === "merged" && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                                        {pr.state}
                                    </span>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${riskColor(pr.risk)}`}>
                                        Risk {pr.risk}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-2">Ready to see your own team's data?</h2>
                        <p className="text-indigo-100 mb-6">Connect your GitHub repository and get real-time insights in under 2 minutes.</p>
                        <a
                            href="/auth/github/login"
                            className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5"
                        >
                            <Github className="w-4 h-4" />
                            Connect with GitHub — It&apos;s Free
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
}
