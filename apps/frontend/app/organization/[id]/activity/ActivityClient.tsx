"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "../../../../lib/api";
import { Card } from "../../../../components/Ui/Card";
import {
    GitCommit,
    GitPullRequest,
    MessageSquare,
} from "lucide-react";

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
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    <p className="text-sm text-text-secondary animate-pulse">Loading activities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold text-text-primary">Recent Activity</h1>
            </header>

            {activities.length === 0 ? (
                <Card className="rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
                    <p className="text-sm text-text-secondary">No activity recorded yet for this organization.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    {/* Main Activity Feed */}
                    <div className="space-y-4">
                        {activities.map((activity) => {
                            const { Icon, bgColor, iconColor } = getActivityIcon(activity);

                            return (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4 rounded-xl border border-border bg-background p-4 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgColor}`}>
                                        <Icon className={`h-5 w-5 ${iconColor}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-text-primary truncate">
                                                    {activity.title}
                                                </h3>
                                                <p className="text-xs text-text-secondary mt-0.5">
                                                    {activity.subtitle}
                                                </p>
                                            </div>
                                            <span className="text-xs text-text-secondary whitespace-nowrap">
                                                {formatTimeAgo(activity.timestamp)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-flex items-center rounded-md bg-surface px-2 py-1 text-xs font-medium text-text-secondary border border-border">
                                                {activity.tag}
                                            </span>
                                            <span className="text-xs text-text-secondary">
                                                by {activity.author}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {hasMore && (
                            <div className="flex justify-center pt-4">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingMore ? "Loading..." : "Load More"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Weekly Summary Sidebar */}
                    <div className="space-y-6">
                        <Card className="rounded-2xl border border-border bg-background p-6 shadow-sm sticky top-6">
                            <h2 className="text-lg font-semibold text-text-primary mb-4">Weekly Summary</h2>
                            <p className="text-sm text-text-secondary mb-6">Activity from the last 7 days</p>

                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Commits</p>
                                    <p className="text-3xl font-semibold text-text-primary">{weeklySummary.commits}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">PRs Opened</p>
                                    <p className="text-3xl font-semibold text-text-primary">{weeklySummary.prsOpened}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">PRs Merged</p>
                                    <p className="text-3xl font-semibold text-text-primary">{weeklySummary.prsMerged}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
