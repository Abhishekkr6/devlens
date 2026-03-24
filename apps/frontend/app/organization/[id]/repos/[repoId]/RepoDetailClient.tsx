"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../../lib/api";
import { Card } from "../../../../../components/Ui/Card";
import { ArrowLeft, ExternalLink, Settings, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { motion } from "motion/react";

type RepoDetail = {
    repo: {
        id: string;
        name: string;
        description: string;
        url: string;
        language?: string;
        provider: string;
        health: "healthy" | "warning" | "attention";
        alerts: {
            total: number;
            open: number;
            criticalOpen: number;
        };
        updatedAt: string | null;
    };
    metrics: {
        totalCommits: {
            value: number;
            change: number;
        };
        openPRs: {
            value: number;
            change: number;
        };
        contributors: {
            value: number;
            change: number;
        };
        churnRate: {
            value: number;
            change: number;
        };
    };
    topContributors: Array<{
        githubId?: string;
        name: string;
        commits: number;
        prs: number;
    }>;
    pullRequests: Array<{
        id: string;
        number: number | null;
        title: string;
        authorName: string;
        authorId?: string;
        risk: number;
        state: string;
        reviewers: number;
        updatedAt: string | null;
    }>;
};

export default function RepoDetailClient({
    orgId,
    repoId,
}: {
    orgId: string;
    repoId: string;
}) {
    const router = useRouter();
    const [data, setData] = useState<RepoDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRepoDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/orgs/${orgId}/repos/${repoId}`);
                setData(res.data.data);
            } catch (err: any) {
                console.error("Failed to fetch repo detail", err);
                setError(err.response?.data?.error || "Failed to load repository details");
            } finally {
                setLoading(false);
            }
        };

        fetchRepoDetail();
    }, [orgId, repoId]);

    const getHealthBadge = (health: string) => {
        switch (health) {
            case "healthy":
                return { text: "good", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
            case "warning":
                return { text: "warning", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" };
            case "attention":
                return { text: "attention", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" };
            default:
                return { text: "unknown", className: "bg-slate-500/10 text-slate-700 dark:text-slate-400" };
        }
    };

    const getRiskBadge = (risk: number) => {
        if (risk >= 60) {
            return { text: "review", className: "bg-red-500/10 text-red-700 dark:text-red-400" };
        } else if (risk >= 30) {
            return { text: "medium", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" };
        } else {
            return { text: "low", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
        }
    };

    const getStatusBadge = (state: string) => {
        switch (state.toLowerCase()) {
            case "open":
                return { text: "open", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" };
            case "merged":
                return { text: "merged", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" };
            case "closed":
                return { text: "closed", className: "bg-slate-500/10 text-slate-700 dark:text-slate-400" };
            default:
                return { text: state, className: "bg-slate-500/10 text-slate-700 dark:text-slate-400" };
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-64 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="rounded-2xl border border-border bg-background p-6">
                                <div className="h-20 rounded bg-slate-100 dark:bg-slate-800" />
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-text-secondary mb-4">{error || "Repository not found"}</p>
                <button
                    onClick={() => router.back()}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface cursor-pointer"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const healthBadge = getHealthBadge(data.repo.health);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col gap-4"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary hover:-translate-x-1 transition-transform cursor-pointer w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Repositories
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                                    {data.repo.name}
                                </h1>
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${healthBadge.className}`}>
                                    {healthBadge.text}
                                </span>
                            </div>
                            <p className="text-sm text-text-secondary">
                                {data.repo.description || "Core API backend service for all platform endpoints"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={data.repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface cursor-pointer flex items-center gap-2"
                        >
                            View on GitHub
                            <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                            onClick={() => router.push(`/organization/${orgId}/repos/${repoId}/settings`)}
                            className="rounded-2xl border border-brand bg-brand px-5 py-2 text-sm font-bold text-white shadow-lg shadow-brand/25 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                        >
                            Configure
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Repository Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand" /> Repository Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Total Commits */}
                    <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden group hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-secondary uppercase tracking-wide">Total Commits</span>
                                <span className={`text-xs font-medium flex items-center gap-1 ${data.metrics.totalCommits.change >= 0 ? "text-emerald-600" : "text-red-600"
                                    }`}>
                                    {data.metrics.totalCommits.change >= 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(data.metrics.totalCommits.change)}% vs last week
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-text-primary">
                                {data.metrics.totalCommits.value}
                            </div>
                        </div>
                    </Card>

                    {/* Open PRs */}
                    <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden group hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-secondary uppercase tracking-wide">Open PRs</span>
                                <span className={`text-xs font-medium flex items-center gap-1 ${data.metrics.openPRs.change <= 0 ? "text-emerald-600" : "text-red-600"
                                    }`}>
                                    {data.metrics.openPRs.change <= 0 ? (
                                        <TrendingDown className="h-3 w-3" />
                                    ) : (
                                        <TrendingUp className="h-3 w-3" />
                                    )}
                                    {Math.abs(data.metrics.openPRs.change)}% vs last week
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-text-primary">
                                {data.metrics.openPRs.value}
                            </div>
                        </div>
                    </Card>

                    {/* Contributors */}
                    <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden group hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-secondary uppercase tracking-wide">Contributors</span>
                                <span className={`text-xs font-medium flex items-center gap-1 ${data.metrics.contributors.change >= 0 ? "text-emerald-600" : "text-red-600"
                                    }`}>
                                    {data.metrics.contributors.change >= 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                    ) : (
                                        <TrendingDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(data.metrics.contributors.change)}% vs last week
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-text-primary">
                                {data.metrics.contributors.value}
                            </div>
                        </div>
                    </Card>

                    {/* Churn Rate */}
                    <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden group hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="flex flex-col gap-2 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-secondary uppercase tracking-wide">Churn Rate</span>
                                <span className={`text-xs font-medium flex items-center gap-1 ${data.metrics.churnRate.change <= 0 ? "text-emerald-600" : "text-red-600"
                                    }`}>
                                    {data.metrics.churnRate.change <= 0 ? (
                                        <TrendingDown className="h-3 w-3" />
                                    ) : (
                                        <TrendingUp className="h-3 w-3" />
                                    )}
                                    {Math.abs(data.metrics.churnRate.change)}% vs last week
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-text-primary">
                                {data.metrics.churnRate.value.toFixed(1)}%
                            </div>
                        </div>
                    </Card>
                </div>
            </motion.div>

            {/* Top Contributors */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2 className="text-lg font-semibold text-text-primary mb-4">Top Contributors</h2>
                <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl shadow-lg relative overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface/30 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Commits
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        PRs
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {data.topContributors.length > 0 ? (
                                    data.topContributors.map((contributor, idx) => (
                                        <tr key={contributor.githubId || idx} className="hover:bg-surface/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                                                {contributor.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                {contributor.commits} commits
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                {contributor.prs} PRs
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-text-secondary">
                                            No contributors data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>

            {/* Recent Pull Requests */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Pull Requests</h2>
                <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl shadow-lg relative overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface/30 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Repo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Author
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Risk
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                        Reviewers
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">

                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {data.pullRequests.length > 0 ? (
                                    data.pullRequests.map((pr) => {
                                        const riskBadge = getRiskBadge(pr.risk);
                                        const statusBadge = getStatusBadge(pr.state);
                                        return (
                                            <tr key={pr.id} className="hover:bg-surface/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-text-primary">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="max-w-xs truncate">{pr.title}</div>
                                                        </div>
                                                        {/* AI Icon - Mobile Only */}
                                                        <div className="sm:hidden flex-shrink-0">
                                                            <Link href={`/organization/${orgId}/repos/${repoId}/pr/${pr.id}`}>
                                                                <button
                                                                    className="h-9 w-9 rounded-lg px-0 py-0 bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all duration-200 cursor-pointer border border-brand/30 hover:border-brand inline-flex items-center justify-center group"
                                                                    aria-label="AI Analysis"
                                                                >
                                                                    <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                                                </button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                    {data.repo.name.split('/').pop()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                    {pr.authorName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${riskBadge.className}`}>
                                                        {riskBadge.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusBadge.className}`}>
                                                        {statusBadge.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                    {pr.reviewers}
                                                </td>
                                                {/* AI Icon - Desktop Only */}
                                                <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-right">
                                                    <Link href={`/organization/${orgId}/repos/${repoId}/pr/${pr.id}`}>
                                                        <button
                                                            className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg px-0 py-0 bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all duration-200 cursor-pointer border border-brand/30 hover:border-brand inline-flex items-center justify-center group"
                                                            aria-label="AI Analysis"
                                                        >
                                                            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-text-secondary">
                                            No pull requests found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
