"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GitCommit, GitPullRequest, MessageSquare, Clock } from "lucide-react";
import { api } from "../../../../../lib/api";
import { Card } from "../../../../../components/Ui/Card";
import Image from "next/image";
import { motion } from "motion/react";

interface DeveloperProfile {
    profile: {
        githubId: string;
        name: string;
        email: string;
        avatarUrl: string | null;
        joinedAt: string;
        weeklyActivity: number;
    };
    metrics: {
        totalCommits: number;
        commitsChange: string;
        totalPRs: number;
        prsChange: string;
        codeReviews: number;
        reviewsChange: string;
        avgReviewTime: string;
        reviewTimeChange: string;
    };
    contributionActivity: Array<{ date: string; count: number }>;
    recentActivity: Array<{
        type: string;
        message: string;
        repo: string;
        timestamp: string;
        prNumber?: number;
    }>;
    activeRepos: Array<{
        name: string;
        role: string;
        commits: number;
        prs: number;
    }>;
}

export default function DeveloperProfileClient({ orgId, developerId }: { orgId: string; developerId: string }) {
    const [profile, setProfile] = useState<DeveloperProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/orgs/${orgId}/developers/${developerId}`);
                setProfile(response.data?.data);
            } catch (error) {
                console.error("Failed to load developer profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (orgId && developerId) {
            fetchProfile();
        }
    }, [orgId, developerId]);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    <p className="text-xs sm:text-sm text-text-secondary animate-pulse">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <p className="text-sm text-text-secondary">Developer not found</p>
            </div>
        );
    }

    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return "just now";
        if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
        return date.toLocaleDateString();
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "commit":
                return { Icon: GitCommit, color: "text-blue-600" };
            case "pr_merged":
                return { Icon: GitPullRequest, color: "text-purple-600" };
            case "pr_opened":
                return { Icon: GitPullRequest, color: "text-green-600" };
            default:
                return { Icon: GitCommit, color: "text-gray-600" };
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4 sm:space-y-6"
        >
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary hover:-translate-x-1 hover:text-text-primary transition-all cursor-pointer"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Developers
            </button>

            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-5 sm:p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 relative z-10">
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-full border-4 border-surface shadow-md bg-gradient-to-br from-indigo-500 to-indigo-400">
                        {profile.profile.avatarUrl ? (
                            <Image
                                alt={profile.profile.name}
                                className="h-full w-full object-cover"
                                height={80}
                                src={profile.profile.avatarUrl}
                                width={80}
                            />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center text-xl sm:text-2xl font-semibold text-white">
                                {profile.profile.name.substring(0, 2).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary mb-1">{profile.profile.name}</h1>
                        <p className="text-sm sm:text-base font-light text-text-secondary">@{profile.profile.githubId}</p>
                        <div className="flex items-center gap-3 mt-3 sm:mt-4">
                            <span className="inline-flex items-center rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-400">
                                Active
                            </span>
                            <span className="text-xs font-medium text-text-secondary px-3 py-1 bg-surface/50 rounded-lg border border-white/5">
                                {profile.profile.weeklyActivity}% Weekly Activity
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
                <MetricCard
                    label="Total Commits"
                    value={profile.metrics.totalCommits}
                    change={profile.metrics.commitsChange}
                    icon={GitCommit}
                />
                <MetricCard
                    label="PRs Created"
                    value={profile.metrics.totalPRs}
                    change={profile.metrics.prsChange}
                    icon={GitPullRequest}
                />
                <MetricCard
                    label="Code Reviews"
                    value={profile.metrics.codeReviews}
                    change={profile.metrics.reviewsChange}
                    icon={MessageSquare}
                />
                <MetricCard
                    label="Avg Review Time"
                    value={profile.metrics.avgReviewTime}
                    change={profile.metrics.reviewTimeChange}
                    icon={Clock}
                    isTime
                />
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-3">
                {/* Main Content - Larger width */}
                <div className="space-y-5 sm:space-y-6 xl:col-span-2">
                    {/* Contribution Activity */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 sm:p-8 shadow-lg relative group hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mb-5 sm:mb-6">
                            Contribution Activity
                        </h2>
                        <ContributionHeatmap data={profile.contributionActivity} />
                        </div>
                    </Card>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                    <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 sm:p-8 shadow-lg relative overflow-hidden group hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)] transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mb-4 sm:mb-6">
                            Recent Activity
                        </h2>
                        <div className="space-y-4 sm:space-y-5">
                            {profile.recentActivity.map((activity, index) => {
                                const { Icon, color } = getActivityIcon(activity.type);
                                const activityTitle = activity.type === "commit"
                                    ? activity.message
                                    : activity.type === "pr_merged"
                                        ? "Code review completed"
                                        : activity.message;
                                const activitySubtitle = activity.type === "commit"
                                    ? `Merged to main branch`
                                    : activity.type === "pr_merged"
                                        ? `Approved PR #${activity.prNumber} with suggestions`
                                        : `PR #${activity.prNumber} opened for review`;

                                return (
                                    <div key={index} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                                        <div className={`mt-1 ${color}`}>
                                            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-text-primary">
                                                {activityTitle}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-text-secondary mt-0.5">
                                                {activitySubtitle}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-blue-700 dark:text-blue-400">
                                                    {activity.repo}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-text-secondary">
                                                    by {profile.profile.name}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-text-secondary whitespace-nowrap">
                                            {formatTimeAgo(activity.timestamp)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        </div>
                    </Card>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5 sm:space-y-6 xl:col-span-1">
                    {/* Quick Info */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                    <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mb-5">Quick Info</h2>
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-text-secondary">
                                    Email
                                </p>
                                <p className="text-xs sm:text-sm text-text-primary mt-1">{profile.profile.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-text-secondary">
                                    Joined
                                </p>
                                <p className="text-xs sm:text-sm text-text-primary mt-1">
                                    {new Date(profile.profile.joinedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </Card>
                    </motion.div>

                    {/* Active Repositories */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                    <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mb-5">
                            Active Repositories
                        </h2>
                        <div className="space-y-3">
                            {profile.activeRepos.map((repo, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-2"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <GitCommit className="h-4 w-4 text-text-secondary shrink-0" />
                                        <span className="text-xs sm:text-sm font-medium text-text-primary truncate">
                                            {repo.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <span className="text-[10px] sm:text-xs text-text-secondary">
                                            {repo.role}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-text-secondary">
                                            <GitCommit className="h-3 w-3" />
                                            <span>{repo.commits}</span>
                                            <GitPullRequest className="h-3 w-3 ml-1" />
                                            <span>{repo.prs}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Button */}
                        <div className="mt-6 sm:mt-8">
                            <a
                                href={`https://github.com/${profile.profile.githubId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-full rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-bold text-text-primary hover:bg-surface-hover hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                                View on GitHub
                            </a>
                        </div>
                    </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

function MetricCard({
    label,
    value,
    change,
    icon: Icon,
    isTime = false,
}: {
    label: string;
    value: number | string;
    change: string;
    icon: any;
    isTime?: boolean;
}) {
    const isPositive = change.startsWith("+");
    const changeColor = isPositive ? "text-emerald-500" : "text-rose-500";

    return (
        <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-4 sm:p-5 shadow-lg relative group transition-all duration-300 hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        {label}
                    </p>
                    <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-semibold text-text-primary">
                        {isTime ? value : typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                </div>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-text-secondary" />
            </div>
            {!isTime && change !== "+0%" && (
                <p className={`mt-2 text-[10px] sm:text-xs font-medium ${changeColor}`}>{change} last week</p>
            )}
        </Card>
    );
}

function ContributionHeatmap({ data }: { data: Array<{ date: string; count: number }> }) {
    const getColor = (count: number) => {
        if (count === 0) return "bg-slate-100 dark:bg-slate-800";
        if (count < 3) return "bg-emerald-200 dark:bg-emerald-900";
        if (count < 6) return "bg-emerald-400 dark:bg-emerald-700";
        if (count < 10) return "bg-emerald-600 dark:bg-emerald-500";
        return "bg-emerald-800 dark:bg-emerald-300";
    };

    // Create a map of dates to counts for easy lookup
    const dataMap = new Map<string, number>();
    data.forEach(item => {
        dataMap.set(item.date, item.count);
    });

    // Generate last 52 weeks of data (GitHub style)
    const weeks: Array<Array<{ date: string; count: number; dayOfWeek: number; month: number }>> = [];
    const today = new Date();

    // Start from 52 weeks ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (52 * 7));

    // Adjust to start on Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    let currentWeek: Array<{ date: string; count: number; dayOfWeek: number; month: number }> = [];

    // Generate 52 weeks × 7 days
    for (let i = 0; i < 52 * 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);

        const dateStr = currentDate.toISOString().split('T')[0];
        const count = dataMap.get(dateStr) || 0;
        const day = currentDate.getDay();
        const month = currentDate.getMonth();

        currentWeek.push({
            date: dateStr,
            count,
            dayOfWeek: day,
            month
        });

        // Start new week on Sunday (day 0)
        if (day === 6 || i === 52 * 7 - 1) {
            weeks.push([...currentWeek]);
            currentWeek = [];
        }
    }

    // Calculate month labels
    const monthLabels: Array<{ label: string; weekIndex: number }> = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
        const firstDay = week[0];
        if (firstDay && firstDay.month !== lastMonth) {
            const monthName = new Date(firstDay.date).toLocaleDateString('en-US', { month: 'short' });
            monthLabels.push({ label: monthName, weekIndex });
            lastMonth = firstDay.month;
        }
    });

    const dayLabels = ['Mon', 'Wed', 'Fri'];
    const dayIndices = [1, 3, 5]; // Mon, Wed, Fri

    // Show fewer weeks on mobile to prevent overflow
    const displayWeeks = weeks.slice(-26); // Last 26 weeks for mobile
    const weeksOffset = weeks.length - displayWeeks.length;

    return (
        <div className="space-y-2 sm:space-y-3">
            {/* Month labels */}
            <div className="flex items-start">
                <div className="w-6 sm:w-8" /> {/* Spacer for day labels */}
                <div className="flex-1 relative h-3 sm:h-4">
                    {monthLabels
                        .filter(month => month.weekIndex >= weeksOffset)
                        .map((month, index) => (
                            <div
                                key={index}
                                className="absolute text-[9px] sm:text-[10px] md:text-xs text-text-secondary whitespace-nowrap"
                                style={{ 
                                    left: `${((month.weekIndex - weeksOffset) / displayWeeks.length) * 100}%` 
                                }}
                            >
                                {month.label}
                            </div>
                        ))}
                </div>
            </div>

            {/* Heatmap grid */}
            <div className="flex items-start gap-0.5 sm:gap-1">
                {/* Day labels */}
                <div className="flex flex-col justify-around h-[80px] sm:h-[90px] md:h-[105px] w-6 sm:w-8">
                    {dayLabels.map((label, index) => (
                        <div key={index} className="text-[8px] sm:text-[9px] md:text-[10px] text-text-secondary text-right pr-0.5 sm:pr-1">
                            {label}
                        </div>
                    ))}
                </div>

                {/* Contribution grid - Responsive sizing */}
                <div className="flex-1 flex gap-[1px] sm:gap-[2px] justify-between">
                    {displayWeeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[1px] sm:gap-[2px]">
                            {week.map((day, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className={`w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] md:w-3 md:h-3 rounded-[1px] sm:rounded-sm ${getColor(day.count)} 
                                        hover:ring-1 hover:ring-emerald-400 transition-all cursor-pointer`}
                                    title={`${day.date}: ${day.count} commit${day.count !== 1 ? 's' : ''}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] md:text-xs text-text-secondary pt-1 sm:pt-2">
                <span>Less</span>
                <div className="flex gap-0.5 sm:gap-1">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-[1px] sm:rounded-sm bg-slate-100 dark:bg-slate-800" />
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-[1px] sm:rounded-sm bg-emerald-200 dark:bg-emerald-900" />
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-[1px] sm:rounded-sm bg-emerald-400 dark:bg-emerald-700" />
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-[1px] sm:rounded-sm bg-emerald-600 dark:bg-emerald-500" />
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-[1px] sm:rounded-sm bg-emerald-800 dark:bg-emerald-300" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
