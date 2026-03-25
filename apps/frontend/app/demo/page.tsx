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
    if (score >= 70) return "text-rose-400 bg-rose-500/10 border border-rose-500/20";
    if (score >= 30) return "text-amber-400 bg-amber-500/10 border border-amber-500/20";
    return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
}

function riskBarColor(score: number) {
    if (score >= 70) return "bg-rose-500";
    if (score >= 30) return "bg-amber-500";
    return "bg-emerald-500";
}

function stateColor(state: string) {
    if (state === "merged") return "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20";
    if (state === "review") return "text-amber-400 bg-amber-500/10 border border-amber-500/20";
    return "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20";
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
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
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
                    <circle key={i} cx={x} cy={y} r="5" fill="#6366f1" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
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
                    <span className="text-sm font-extrabold text-white">{d.count}</span>
                    <div
                        className="w-full rounded-t-xl transition-all shadow-lg"
                        style={{
                            height: `${(d.count / max) * 80}px`,
                            backgroundColor: d.color,
                            boxShadow: `0 0 20px ${d.color}60`,
                        }}
                    />
                    <span className="text-[10px] font-bold text-text-secondary text-center leading-tight uppercase tracking-wider">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Nav ───────────────────────────────────────────────────────────────────────

function DemoNav() {
    const [open, setOpen] = useState(false);
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/[0.06] py-3 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-1.5 group">
                    <img src="/logo.jpg" alt="DevLens" className="w-10 h-10 group-hover:scale-105 transition-transform" />
                    <span className="text-xl font-extrabold tracking-tight text-white" style={{ fontFamily: "var(--font-logo)" }}>
                        DevLens
                    </span>
                </Link>
                <div className="hidden md:flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                        <Activity className="w-3 h-3" />
                        Demo Mode — Mock Data
                    </span>
                    <Link
                        href="/"
                        className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </Link>
                    <a
                        href="/auth/github/login"
                        className="flex items-center gap-2 bg-brand hover:bg-brand/80 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(94,106,210,0.4)] hover:shadow-[0_0_30px_rgba(94,106,210,0.6)]"
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
                <div className="md:hidden border-t border-white/10 bg-slate-950/80 backdrop-blur-2xl px-4 py-4 flex flex-col gap-3">
                    <Link href="/" className="text-sm font-medium text-text-secondary" onClick={() => setOpen(false)}>
                        ← Back to Home
                    </Link>
                    <a
                        href="/auth/github/login"
                        className="flex items-center justify-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-bold"
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
            iconColor: "text-indigo-400",
            glowColor: "rgba(99,102,241,0.3)",
            bgGlow: "from-indigo-500/10",
        },
        {
            label: "Open PRs",
            value: MOCK_KPIs.openPRs,
            icon: GitPullRequest,
            trend: null,
            helper: "Awaiting review or merge",
            iconColor: "text-blue-400",
            glowColor: "rgba(59,130,246,0.3)",
            bgGlow: "from-blue-500/10",
        },
        {
            label: "Team Members",
            value: MOCK_KPIs.teamMembers,
            icon: Users,
            trend: null,
            helper: "Active contributors this week",
            iconColor: "text-emerald-400",
            glowColor: "rgba(16,185,129,0.3)",
            bgGlow: "from-emerald-500/10",
        },
        {
            label: "Critical Alerts",
            value: MOCK_KPIs.criticalAlerts,
            icon: AlertCircle,
            trend: null,
            helper: "High-risk pull requests",
            iconColor: "text-rose-400",
            glowColor: "rgba(244,63,94,0.3)",
            bgGlow: "from-rose-500/10",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            <DemoNav />

            {/* Ambient background glows */}
            <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="fixed top-1/3 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Hero banner */}
            <div className="pt-20 pb-0 relative z-10 border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-full border border-brand/20 mb-4 shadow-[0_0_15px_rgba(94,106,210,0.2)]">
                            <Sparkles className="w-3 h-3 animate-pulse" />
                            Interactive Demo
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Acme Engineering · Dashboard
                        </h1>
                        <p className="mt-2 text-base text-text-secondary font-medium">
                            Live preview with realistic mock data. Your own data will look even better.
                        </p>
                    </div>
                    <a
                        href="/auth/github/login"
                        className="shrink-0 flex items-center gap-2.5 bg-gradient-to-r from-brand to-indigo-500 hover:from-brand/90 hover:to-indigo-500/90 text-white px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-[0_0_30px_rgba(94,106,210,0.4)] hover:shadow-[0_0_40px_rgba(94,106,210,0.6)] hover:-translate-y-0.5 active:scale-95"
                    >
                        <Github className="w-5 h-5" />
                        Connect Your Repo
                    </a>
                </div>
            </div>

            {/* Dashboard content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* KPI cards */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map(({ label, value, icon: Icon, trend, helper, iconColor, glowColor, bgGlow }) => (
                        <div key={label} className={`relative group rounded-3xl border border-white/10 bg-surface/40 backdrop-blur-xl p-6 shadow-2xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-white/20`}>
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${bgGlow} to-transparent pointer-events-none`} />
                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-text-secondary">
                                        {label}
                                    </p>
                                    <p className="mt-3 text-4xl font-extrabold text-white tracking-tight">{value}</p>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform" style={{ boxShadow: `0 0 20px ${glowColor}` }}>
                                    <Icon className={`h-6 w-6 ${iconColor}`} />
                                </div>
                            </div>
                            {trend !== null ? (
                                <span
                                    className={`relative z-10 mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${trend >= 0
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                    }`}
                                >
                                    {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                    {Math.abs(trend).toFixed(1)}% {trend >= 0 ? "increase" : "decrease"}
                                </span>
                            ) : (
                                <p className="relative z-10 mt-4 text-xs font-medium text-text-secondary">{helper}</p>
                            )}
                        </div>
                    ))}
                </section>

                {/* Charts row */}
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Commit chart */}
                    <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-surface/40 backdrop-blur-xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">Weekly Activity</h2>
                                <p className="text-sm text-text-secondary font-medium mt-0.5">Commit trend for the past month</p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-full border border-brand/20">
                                <BarChart3 className="w-3.5 h-3.5" />
                                Live updates
                            </span>
                        </div>
                        <div className="h-[160px] rounded-2xl bg-black/20 p-2 border border-white/5 shadow-inner">
                            <MiniLineChart data={MOCK_COMMIT_TIMELINE} />
                        </div>
                        <div className="mt-4 flex gap-4 text-xs text-text-secondary bg-black/20 rounded-xl px-4 py-3 border border-white/5">
                            {MOCK_COMMIT_TIMELINE.slice(-4).map((d) => (
                                <span key={d.date} className="flex flex-col items-center gap-0.5">
                                    <span className="font-extrabold text-white text-sm">{d.count}</span>
                                    <span className="text-[10px] uppercase tracking-widest">{d.date}</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* PR Status */}
                    <div className="rounded-3xl border border-white/10 bg-surface/40 backdrop-blur-xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white tracking-tight">PR Status</h2>
                            <div className="h-9 w-9 rounded-xl bg-brand/20 flex items-center justify-center border border-brand/30 shadow-[0_0_15px_rgba(94,106,210,0.3)]">
                                <Sparkles className="w-4 h-4 text-brand" />
                            </div>
                        </div>
                        <ul className="space-y-3">
                            {[
                                { label: "Open", value: MOCK_PR_STATUS.open, color: "text-emerald-400", glow: "from-emerald-500/10" },
                                { label: "In Review", value: MOCK_PR_STATUS.review, color: "text-amber-400", glow: "from-amber-500/10" },
                                { label: "Merged", value: MOCK_PR_STATUS.merged, color: "text-indigo-400", glow: "from-indigo-500/10" },
                            ].map((item) => (
                                <li key={item.label} className={`relative flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-5 py-4 overflow-hidden group hover:border-white/15 transition-all`}>
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r ${item.glow} to-transparent transition-opacity pointer-events-none`} />
                                    <span className="relative z-10 text-sm font-bold text-text-secondary uppercase tracking-wider">{item.label}</span>
                                    <span className={`relative z-10 text-2xl font-extrabold ${item.color}`}>{item.value}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 rounded-2xl border border-brand/20 bg-brand/10 px-5 py-3 text-xs font-bold text-brand shadow-[0_0_15px_rgba(94,106,210,0.15)]">
                            ⚡ Average merge time is <strong className="text-white">4.2h</strong>
                        </div>
                    </div>
                </section>

                {/* Bottom row */}
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Risk chart */}
                    <div className="rounded-3xl border border-white/10 bg-surface/40 backdrop-blur-xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">PR Risk Distribution</h2>
                                <p className="text-sm text-text-secondary font-medium mt-0.5">AI-scored pull requests by risk level</p>
                            </div>
                            <div className="h-9 w-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <ShieldAlert className="w-4 h-4 text-amber-400" />
                            </div>
                        </div>
                        <div className="bg-black/20 rounded-2xl p-4 border border-white/5 shadow-inner">
                            <MiniBarChart data={MOCK_RISK_BUCKETS} />
                        </div>
                    </div>

                    {/* Top contributors */}
                    <div className="rounded-3xl border border-white/10 bg-surface/40 backdrop-blur-xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white tracking-tight mb-6">Top Contributors</h2>
                        <div className="space-y-4">
                            {MOCK_CONTRIBUTORS.map((c, i) => {
                                const pct = Math.round((c.commits / MOCK_CONTRIBUTORS[0].commits) * 100);
                                return (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="relative">
                                            <img
                                                src={c.avatar}
                                                alt={c.name}
                                                className="w-10 h-10 rounded-xl border-2 border-white/10 object-cover flex-shrink-0 group-hover:border-brand/50 transition-all"
                                            />
                                            {i === 0 && <span className="absolute -top-1.5 -right-1.5 text-xs">🏆</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-bold text-white truncate group-hover:text-brand transition-colors">{c.name}</span>
                                                <span className="text-xs font-extrabold text-brand ml-2 flex-shrink-0 bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20">
                                                    {c.commits} commits
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className="h-1.5 rounded-full bg-gradient-to-r from-brand to-indigo-400 shadow-[0_0_8px_rgba(94,106,210,0.5)] transition-all duration-500"
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
                <section className="rounded-3xl border border-white/10 bg-surface/40 backdrop-blur-xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Recent Pull Requests</h2>
                            <p className="text-sm text-text-secondary font-medium mt-0.5">AI-scored for risk and complexity</p>
                        </div>
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">AI Risk Score</span>
                    </div>
                    <div className="space-y-3">
                        {MOCK_RECENT_PRS.map((pr) => (
                            <div
                                key={pr.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-white/5 bg-black/20 hover:border-brand/30 hover:bg-brand/5 transition-all duration-300 group"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate group-hover:text-brand transition-colors">{pr.title}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs font-semibold text-text-secondary">@{pr.author}</span>
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                                            <Clock className="w-3 h-3" />
                                            {pr.time}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 flex-shrink-0">
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize flex items-center gap-1 ${stateColor(pr.state)}`}>
                                        {pr.state === "merged" && <CheckCircle2 className="w-3 h-3" />}
                                        {pr.state}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${riskBarColor(pr.risk)} transition-all`} style={{ width: `${pr.risk}%` }} />
                                        </div>
                                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${riskColor(pr.risk)}`}>
                                            {pr.risk}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="rounded-3xl overflow-hidden relative shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand via-indigo-600 to-purple-700" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full transform translate-x-10 -translate-y-10 pointer-events-none" />
                    <div className="relative z-10 p-10 sm:p-14 text-center">
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-white/70 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 mb-6">
                            <Sparkles className="w-3 h-3" />
                            No credit card required
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">Ready to see your own team's data?</h2>
                        <p className="text-indigo-200 mb-8 text-base font-medium max-w-xl mx-auto">Connect your GitHub repository and get real-time AI-powered insights in under 2 minutes.</p>
                        <a
                            href="/auth/github/login"
                            className="inline-flex items-center gap-2.5 bg-white text-indigo-700 hover:bg-indigo-50 px-10 py-4 rounded-2xl text-sm font-extrabold transition-all shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 active:scale-95"
                        >
                            <Github className="w-5 h-5" />
                            Connect with GitHub — It&apos;s Free
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
}

