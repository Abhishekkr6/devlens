"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "../../../../../components/Layout/DashboardLayout";
import { api } from "../../../../../lib/api";
import { Card } from "../../../../../components/Ui/Card";
import { Badge } from "../../../../../components/Ui/Badge";
import { Button } from "../../../../../components/Ui/Button";
import {
  GitPullRequest,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";

type PR = {
  _id: string;
  number: number;
  title: string;
  state: string;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  repoId: string;
  author: string;
  reviewers: string[];
  comments: number;
  additions: number;
  deletions: number;
  changedFiles: number;
};

type PRStatus = "open" | "review" | "merged";

const statusConfig = {
  open: { label: "Open", color: "bg-blue-50 text-blue-700", icon: GitPullRequest },
  review: { label: "Review", color: "bg-yellow-50 text-yellow-700", icon: MessageSquare },
  merged: { label: "Merged", color: "bg-green-50 text-green-700", icon: CheckCircle },
};

const riskConfig = {
  low: { label: "Low Risk", color: "bg-green-50 text-green-700", icon: CheckCircle },
  medium: { label: "Medium Risk", color: "bg-yellow-50 text-yellow-700", icon: Clock },
  high: { label: "High Risk", color: "bg-red-50 text-red-700", icon: AlertTriangle },
};

export default function PRsPage() {
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PRStatus | "all">("all");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");

  const { id: orgId } = useParams();

  const loadPRs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/prs");
      setPrs(res.data?.data?.items || []);
    } catch (err) {
      console.error("PRs load failed", err);
      setPrs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPRs();
  }, [loadPRs]);

  const filteredPRs = useMemo(() => {
    return prs.filter((pr) => {
      const matchesSearch = pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pr.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pr.number.toString().includes(searchQuery);

      const matchesStatus = statusFilter === "all" || pr.state.toLowerCase() === statusFilter;

      let matchesRisk = true;
      if (riskFilter !== "all") {
        const risk = pr.riskScore;
        if (riskFilter === "low") matchesRisk = risk < 0.3;
        else if (riskFilter === "medium") matchesRisk = risk >= 0.3 && risk < 0.6;
        else if (riskFilter === "high") matchesRisk = risk >= 0.6;
      }

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [prs, searchQuery, statusFilter, riskFilter]);

  const formatTimeAgo = (input: string) => {
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

  const getRiskLevel = (score: number): "low" | "medium" | "high" => {
    if (score < 0.3) return "low";
    if (score < 0.6) return "medium";
    return "high";
  };

  const summary = useMemo(() => {
    const total = prs.length;
    const open = prs.filter((pr) => pr.state.toLowerCase() === "open").length;
    const review = prs.filter((pr) => pr.state.toLowerCase() === "review").length;
    const merged = prs.filter((pr) => pr.state.toLowerCase() === "merged").length;
    const highRisk = prs.filter((pr) => pr.riskScore >= 0.6).length;

    return { total, open, review, merged, highRisk };
  }, [prs]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Pull Requests</h1>
          <p className="text-sm text-slate-500">
            Manage and review pull requests across your repositories.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                <GitPullRequest className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
                <p className="text-lg font-semibold text-slate-900">{summary.total}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <GitPullRequest className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Open</p>
                <p className="text-lg font-semibold text-slate-900">{summary.open}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                <MessageSquare className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review</p>
                <p className="text-lg font-semibold text-slate-900">{summary.review}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <CheckCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Merged</p>
                <p className="text-lg font-semibold text-slate-900">{summary.merged}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">High Risk</p>
                <p className="text-lg font-semibold text-slate-900">{summary.highRisk}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search PRs by title, author, or number..."
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PRStatus | "all")}
              className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="review">Review</option>
              <option value="merged">Merged</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as "all" | "low" | "medium" | "high")}
              className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Risk</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Card className="rounded-2xl border-0 bg-white p-6 text-sm text-slate-500 shadow-md">
            Loading pull requests…
          </Card>
        ) : filteredPRs.length === 0 ? (
          <Card className="rounded-2xl border-0 bg-white p-6 text-sm text-slate-500 shadow-md">
            {prs.length === 0
              ? "No pull requests found. Once PRs are created they will appear here."
              : "No pull requests match your current filters."}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPRs.map((pr) => {
              const status = pr.state.toLowerCase() as PRStatus;
              const riskLevel = getRiskLevel(pr.riskScore);
              const StatusIcon = statusConfig[status].icon;
              const RiskIcon = riskConfig[riskLevel].icon;

              return (
                <Card key={pr._id} className="rounded-2xl border-0 bg-white p-6 shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusConfig[status].color}`}>
                          <StatusIcon className="h-5 w-5" />
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{pr.title}</h3>
                            <Badge type="secondary">#{pr.number}</Badge>
                          </div>
                          <p className="text-sm text-slate-500">
                            by {pr.author} • {formatTimeAgo(pr.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge type={status === "merged" ? "success" : status === "open" ? "info" : "warning"}>
                          {statusConfig[status].label}
                        </Badge>
                        <Badge type={riskLevel === "high" ? "danger" : riskLevel === "medium" ? "warning" : "success"}>
                          <RiskIcon className="mr-1 h-3 w-3" />
                          {riskConfig[riskLevel].label}
                        </Badge>
                        <Badge type="secondary">
                          +{pr.additions} -{pr.deletions}
                        </Badge>
                        <Badge type="secondary">
                          {pr.changedFiles} file{pr.changedFiles === 1 ? "" : "s"}
                        </Badge>
                        <Badge type="secondary">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          {pr.comments}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="primary" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
