"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "../../../../../components/Layout/DashboardLayout";
import { api } from "../../../../../lib/api";
import { Card } from "../../../../../components/Ui/Card";
import { Badge } from "../../../../../components/Ui/Badge";
import { Button } from "../../../../../components/Ui/Button";
import {
  Users,
  GitCommit,
  GitPullRequest,
  MessageSquare,
  Search,
  Filter,
} from "lucide-react";

type Developer = {
  _id: string;
  githubId: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  email?: string;
  stats: {
    commits: number;
    prsCreated: number;
    prsReviewed: number;
    avgPRTimeHours: number;
    riskScore: number;
  };
  lastActivity: string;
  joinedAt: string;
};

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"commits" | "prs" | "reviews" | "activity">("commits");

  const { id: orgId } = useParams();

  const loadDevelopers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/developers");
      setDevelopers(res.data?.data || []);
    } catch (err) {
      console.error("Developers load failed", err);
      setDevelopers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevelopers();
  }, [loadDevelopers]);

  const filteredAndSortedDevelopers = useMemo(() => {
    let filtered = developers.filter((dev) =>
      dev.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dev.name && dev.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "commits":
          return b.stats.commits - a.stats.commits;
        case "prs":
          return b.stats.prsCreated - a.stats.prsCreated;
        case "reviews":
          return b.stats.prsReviewed - a.stats.prsReviewed;
        case "activity":
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [developers, searchQuery, sortBy]);

  const formatTimeAgo = (input: string) => {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return "Never";

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
    const total = developers.length;
    const active = developers.filter((dev) => {
      const lastActivity = new Date(dev.lastActivity);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return lastActivity > weekAgo;
    }).length;
    const totalCommits = developers.reduce((sum, dev) => sum + dev.stats.commits, 0);
    const totalPRs = developers.reduce((sum, dev) => sum + dev.stats.prsCreated, 0);

    return { total, active, totalCommits, totalPRs };
  }, [developers]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Developers</h1>
          <p className="text-sm text-slate-500">
            Monitor developer activity and contributions.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
                <p className="text-lg font-semibold text-slate-900">{summary.total}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active</p>
                <p className="text-lg font-semibold text-slate-900">{summary.active}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <GitCommit className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Commits</p>
                <p className="text-lg font-semibold text-slate-900">{summary.totalCommits}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <GitPullRequest className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">PRs</p>
                <p className="text-lg font-semibold text-slate-900">{summary.totalPRs}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search developers..."
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "commits" | "prs" | "reviews" | "activity")}
              className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="commits">Sort by Commits</option>
              <option value="prs">Sort by PRs</option>
              <option value="reviews">Sort by Reviews</option>
              <option value="activity">Sort by Activity</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Card className="rounded-2xl border-0 bg-white p-6 text-sm text-slate-500 shadow-md">
            Loading developers…
          </Card>
        ) : filteredAndSortedDevelopers.length === 0 ? (
          <Card className="rounded-2xl border-0 bg-white p-6 text-sm text-slate-500 shadow-md">
            {developers.length === 0
              ? "No developers found. Once team members join they will appear here."
              : "No developers match your search."}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredAndSortedDevelopers.map((dev) => (
              <Card key={dev._id} className="rounded-2xl border-0 bg-white p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <img
                    src={dev.avatarUrl || "/default-avatar.png"}
                    alt={dev.username}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {dev.name || dev.username}
                      </h3>
                      <p className="text-sm text-slate-500">@{dev.username}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Commits</p>
                        <p className="text-lg font-semibold text-slate-900">{dev.stats.commits}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">PRs Created</p>
                        <p className="text-lg font-semibold text-slate-900">{dev.stats.prsCreated}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviews</p>
                        <p className="text-lg font-semibold text-slate-900">{dev.stats.prsReviewed}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg PR Time</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {dev.stats.avgPRTimeHours ? `${dev.stats.avgPRTimeHours}h` : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        Last active {formatTimeAgo(dev.lastActivity)}
                      </p>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
