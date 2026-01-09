"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "../../../../lib/api";
import { Card } from "../../../../components/Ui/Card";
import { Badge } from "../../../../components/Ui/Badge";
import { useUserStore } from "../../../../store/userStore";
import {
    GitCommit,
    GitPullRequest,
    MessageSquare,
    Search,
} from "lucide-react";

type Commit = {
    _id: string;
    total: number;
};

type PR = {
    _id?: string;
    number?: number;
    title?: string;
    state?: string;
    repoId?: string;
    createdAt?: string;
};

type ActivityEvent = {
    id: string;
    title: string;
    subtitle: string;
    tag: string;
    timestamp: string;
    kind: "commit" | "pr" | "review";
};

export default function ActivityClient({ orgSlug, orgId: propOrgId }: { orgSlug?: string; orgId?: string }) {
    const [timeline, setTimeline] = useState<Commit[]>([]);
    const [prs, setPrs] = useState<PR[]>([]);
    const [loading, setLoading] = useState(true);

    // Get orgId from slug if provided, otherwise use propOrgId
    const { user } = useUserStore();
    const orgId = orgSlug ? user?.orgIds?.find(o => o.slug === orgSlug)?._id : propOrgId;

    useEffect(() => {
        if (!orgSlug) return;
        const loadActivity = async () => {
            try {
                setLoading(true);
                const [timelineRes, prsRes] = await Promise.all([
                    api.get(`/orgs/slug/${orgSlug}/activity/commits`),
                    api.get(`/orgs/slug/${orgSlug}/prs`),
                ]);

                setTimeline(timelineRes.data?.data || []);
                setPrs(prsRes.data?.data?.items || []);
            } catch (err) {
                console.error("Activity load failed", err);
                setTimeline([]);
                setPrs([]);
            } finally {
                setLoading(false);
            }
        };

        loadActivity();
    }, [orgSlug]);

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

    const summary = useMemo(() => {
        const totalCommits = timeline.reduce((sum, commit) => sum + (commit.total ?? 0), 0);
        const openPrs = prs.filter((pr) => pr.state?.toLowerCase() === "open").length;
        const reviewPrs = prs.filter((pr) => pr.state?.toLowerCase() === "review").length;
        const mergedPrs = prs.filter((pr) => pr.state?.toLowerCase() === "merged").length;

        return {
            commits: totalCommits,
            prsOpened: openPrs,
            reviews: reviewPrs || mergedPrs,
        };
    }, [timeline, prs]);

    const recentEvents = useMemo(() => {
        const commitEvents: ActivityEvent[] = timeline.slice(-5).map((commit) => ({
            id: `commit-${commit._id}`,
            title: `${commit.total} commit${commit.total === 1 ? "" : "s"} pushed`,
            subtitle: "Activity captured",
            tag: "commits",
            timestamp: commit._id,
            kind: "commit",
        }));

        const prEvents: ActivityEvent[] = prs.slice(0, 5).map((pr) => ({
            id: pr._id ?? `pr-${pr.number}`,
            title: pr.title || `Pull request #${pr.number ?? ""}`,
            subtitle:
                pr.state?.toLowerCase() === "merged"
                    ? "Merged to main branch"
                    : pr.state?.toLowerCase() === "open"
                        ? "Opened for review"
                        : `PR ${pr.state ?? "updated"}`,
            tag: pr.repoId ? `repo:${pr.repoId}` : "pull-requests",
            timestamp: pr.createdAt || new Date().toISOString(),
            kind: pr.state?.toLowerCase() === "review" ? "review" : "pr",
        }));

        return [...prEvents, ...commitEvents]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 8);
    }, [timeline, prs]);

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold text-text-primary">Activity</h1>
                <p className="text-sm text-text-secondary">
                    Recent commits and pull requests for this organization.
                </p>
            </header>

            {loading ? (
                <Card className="rounded-2xl border-0 bg-background p-6 text-sm text-text-secondary shadow-md">
                    Loading activity…
                </Card>
            ) : recentEvents.length === 0 ? (
                <Card className="rounded-2xl border-0 bg-background p-6 text-sm text-text-secondary shadow-md">
                    No activity recorded yet for this organization.
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <Card className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
                        <p className="text-sm text-text-secondary mb-6">Latest updates from your team</p>

                        <div className="space-y-4">
                            {recentEvents.map((event) => {
                                const iconClasses = "h-10 w-10 flex items-center justify-center rounded-xl shrink-0";
                                const baseIconStyles =
                                    event.kind === "commit"
                                        ? "bg-white text-indigo-600 shadow-sm"
                                        : event.kind === "review"
                                            ? "bg-white text-emerald-600 shadow-sm"
                                            : "bg-white text-amber-600 shadow-sm";

                                return (
                                    <div
                                        key={event.id}
                                        className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:gap-4"
                                    >
                                        <span className={`${iconClasses} ${baseIconStyles}`}>
                                            {event.kind === "commit" && <GitCommit className="h-5 w-5" />}
                                            {event.kind === "pr" && <GitPullRequest className="h-5 w-5" />}
                                            {event.kind === "review" && <MessageSquare className="h-5 w-5" />}
                                        </span>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="text-sm font-semibold text-text-primary">{event.title}</div>
                                                <div className="text-xs text-text-secondary">{formatTimeAgo(event.timestamp)}</div>
                                            </div>
                                            <p className="text-xs uppercase tracking-wide text-text-secondary">{event.subtitle}</p>
                                            <Badge type={event.kind === "review" ? "success" : event.kind === "commit" ? "info" : "warning"}>
                                                {event.tag}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-text-primary">Weekly Summary</h2>
                            <p className="text-sm text-text-secondary mb-6">Snapshot of the last 30 days</p>

                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Commits</p>
                                    <p className="text-3xl font-semibold text-text-primary">{summary.commits}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">PRs opened</p>
                                    <p className="text-3xl font-semibold text-text-primary">{summary.prsOpened}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Reviews/Merged</p>
                                    <p className="text-3xl font-semibold text-text-primary">{summary.reviews}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
