"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "../../../../lib/api";
import { Card } from "../../../../components/Ui/Card";
import {
    GitCommit,
    GitPullRequest,
    MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";

type Activity = {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    tag: string;
    author: string;
    timestamp: string;
    icon: string;
};

type ActivityResponse = {
    items: Activity[];
    page: number;
    pageSize: number;
    total: number;
};

export default function ActivityClient({ orgId }: { orgId: string }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadActivities = async (pageNum: number, append = false) => {
        try {
            if (!append) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await api.get(`/orgs/${orgId}/activities?page=${pageNum}&pageSize=50`);
            const data: ActivityResponse = response.data?.data;

            if (data && data.items) {
                if (append) {
                    setActivities(prev => [...prev, ...data.items]);
                } else {
                    setActivities(data.items);
                }
                setHasMore(data.items.length === data.pageSize);
            }
        } catch (err) {
            console.error("Activity load failed", err);
            if (!append) {
                setActivities([]);
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (!orgId) return;
        loadActivities(1, false);
    }, [orgId]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadActivities(nextPage, true);
    };

    const formatTimeAgo = (input?: string) => {
        if (!input) return "Just now";
        const date = new Date(input);
        if (Number.isNaN(date.getTime())) return "Just now";

        const diffMs = Date.now() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        if (diffMinutes < 1) return "Just now";
        if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
        const diffMonths = Math.floor(diffDays / 30);
        if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
        const diffYears = Math.floor(diffDays / 365);
        return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
    };

    const getActivityIcon = (activity: Activity) => {
        const iconType = activity.icon || activity.type;

        if (iconType === "commit") {
            return {
                Icon: GitCommit,
                bgColor: "bg-blue-50 dark:bg-blue-900/20",
                iconColor: "text-blue-600 dark:text-blue-400",
            };
        } else if (iconType === "pr_merged" || activity.type === "pr_merged") {
            return {
                Icon: GitCommit,
                bgColor: "bg-blue-50 dark:bg-blue-900/20",
                iconColor: "text-blue-600 dark:text-blue-400",
            };
        } else if (iconType === "pr" || activity.type.startsWith("pr")) {
            return {
                Icon: GitPullRequest,
                bgColor: "bg-purple-50 dark:bg-purple-900/20",
                iconColor: "text-purple-600 dark:text-purple-400",
            };
        } else {
            return {
                Icon: MessageSquare,
                bgColor: "bg-green-50 dark:bg-green-900/20",
                iconColor: "text-green-600 dark:text-green-400",
            };
        }
    };

    // Calculate weekly summary
    const weeklySummary = useMemo(() => {
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

        const weeklyActivities = activities.filter(activity => {
            const activityTime = new Date(activity.timestamp).getTime();
            return activityTime >= weekAgo;
        });

        const commits = weeklyActivities.filter(a => a.type === "commit").length;
        const prsOpened = weeklyActivities.filter(a => a.type === "pr_opened").length;
        const prsMerged = weeklyActivities.filter(a => a.type === "pr_merged").length;

        return {
            commits,
            prsOpened,
            prsMerged,
        };
    }, [activities]);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    <p className="text-xs sm:text-sm text-text-secondary animate-pulse">Loading activities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-1 sm:space-y-2"
            >
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">Recent Activity</h1>
                <p className="mt-2 text-sm sm:text-base text-text-secondary font-light">Global timeline for your organization</p>
            </motion.header>

            {activities.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card className="rounded-3xl border border-dashed border-white/10 bg-surface/30 p-8 sm:p-12 text-center shadow-none flex flex-col items-center justify-center">
                        <MessageSquare className="w-10 h-10 text-text-secondary mb-3 opacity-50" />
                        <p className="text-sm sm:text-base text-text-secondary font-medium">No activity recorded yet for this organization.</p>
                    </Card>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    {/* Main Activity Feed */}
                    <div className="space-y-4">
                        {activities.map((activity, i) => {
                            const { Icon, bgColor, iconColor } = getActivityIcon(activity);

                            return (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                    className="flex items-start gap-3 sm:gap-5 rounded-3xl border border-white/5 bg-surface/40 backdrop-blur-lg p-4 sm:p-5 shadow-sm hover:shadow-lg hover:border-white/10 transition-all group"
                                >
                                    <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl ${bgColor}`}>
                                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm sm:text-base font-bold text-text-primary truncate transition-colors group-hover:text-brand">
                                                    {activity.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                                                    {activity.subtitle}
                                                </p>
                                            </div>
                                            <span className="text-[10px] sm:text-xs font-semibold text-text-secondary whitespace-nowrap bg-surface px-2 py-1 rounded-lg border border-white/5">
                                                {formatTimeAgo(activity.timestamp)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 sm:gap-3 mt-3">
                                            <span className="inline-flex items-center rounded-lg bg-surface/80 px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-bold text-text-secondary border border-white/5 shadow-sm">
                                                {activity.tag}
                                            </span>
                                            <span className="text-xs text-text-secondary font-medium">
                                                by {activity.author}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {hasMore && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-4 sm:pt-6">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="rounded-full border border-brand/50 bg-brand/10 px-6 sm:px-8 py-2.5 sm:py-3 text-sm font-bold text-brand hover:bg-brand hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    {loadingMore ? "Loading..." : "Load More Activity"}
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Weekly Summary Sidebar */}
                    <div className="space-y-4 sm:space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="sticky top-6"
                        >
                            <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 blur-[50px] rounded-full pointer-events-none" />
                                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mb-2">Weekly Summary</h2>
                                <p className="text-xs sm:text-sm text-text-secondary mb-6 font-medium">Activity from the last 7 days</p>

                                <div className="space-y-5 sm:space-y-6 relative z-10">
                                    <div className="space-y-1.5 p-4 rounded-2xl bg-surface/50 border border-white/5">
                                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2"><GitCommit className="w-3.5 h-3.5"/> Commits</p>
                                        <p className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">{weeklySummary.commits}</p>
                                    </div>

                                    <div className="space-y-1.5 p-4 rounded-2xl bg-surface/50 border border-white/5">
                                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2"><GitPullRequest className="w-3.5 h-3.5"/> PRs Opened</p>
                                        <p className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">{weeklySummary.prsOpened}</p>
                                    </div>

                                    <div className="space-y-1.5 p-4 rounded-2xl bg-surface/50 border border-white/5">
                                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2"><GitCommit className="w-3.5 h-3.5 text-purple-400"/> PRs Merged</p>
                                        <p className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">{weeklySummary.prsMerged}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}
