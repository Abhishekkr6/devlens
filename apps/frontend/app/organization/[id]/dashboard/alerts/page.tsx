"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "../../../../../components/Layout/DashboardLayout";
import { api } from "../../../../../lib/api";
import { Card } from "../../../../../components/Ui/Card";
import { Badge } from "../../../../../components/Ui/Badge";
import { Button } from "../../../../../components/Ui/Button";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  GitPullRequest,
  Search,
  Filter,
} from "lucide-react";

type Alert = {
  _id: string;
  type: "high_risk_pr" | "stale_pr" | "large_pr" | "no_reviews";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  prId?: string;
  prNumber?: number;
  prTitle?: string;
  repoId: string;
  repoName: string;
  createdAt: string;
  resolvedAt?: string;
  status: "active" | "resolved";
};

const severityConfig = {
  low: { label: "Low", color: "bg-blue-50 text-blue-700", icon: Clock },
  medium: { label: "Medium", color: "bg-yellow-50 text-yellow-700", icon: AlertTriangle },
  high: { label: "High", color: "bg-orange-50 text-orange-700", icon: AlertTriangle },
  critical: { label: "Critical", color: "bg-red-50 text-red-700", icon: AlertTriangle },
};

const typeConfig = {
  high_risk_pr: { label: "High Risk PR", icon: AlertTriangle },
  stale_pr: { label: "Stale PR", icon: Clock },
  large_pr: { label: "Large PR", icon: GitPullRequest },
  no_reviews: { label: "No Reviews", icon: GitPullRequest },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "low" | "medium" | "high" | "critical">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("all");

  const { id: orgId } = useParams();

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      // Assuming alerts endpoint exists, adjust if needed
      const res = await api.get("/alerts");
      setAlerts(res.data?.data || []);
    } catch (err) {
      console.error("Alerts load failed", err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           alert.repoName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
      const matchesStatus = statusFilter === "all" || alert.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

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

  const summary = useMemo(() => {
    const total = alerts.length;
    const active = alerts.filter((alert) => alert.status === "active").length;
    const resolved = alerts.filter((alert) => alert.status === "resolved").length;
    const critical = alerts.filter((alert) => alert.severity === "critical" && alert.status === "active").length;

    return { total, active, resolved, critical };
  }, [alerts]);

  const resolveAlert = async (alertId: string) => {
    try {
      await api.patch(`/alerts/${alertId}`, { status: "resolved" });
      setAlerts((prev) =>
        prev.map((alert) =>
          alert._id === alertId ? { ...alert, status: "resolved", resolvedAt: new Date().toISOString() } : alert
        )
      );
    } catch (err) {
      console.error("Failed to resolve alert", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Alerts</h1>
          <p className="text-sm text-slate-500">
            Monitor and manage alerts across your repositories.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
                <p className="text-lg font-semibold text-slate-900">{summary.total}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active</p>
                <p className="text-lg font-semibold text-slate-900">{summary.active}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <CheckCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resolved</p>
                <p className="text-lg font-semibold text-slate-900">{summary.resolved}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-0 bg-white p-4 shadow-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Critical</p>
                <p className="text-lg font-semibold text-slate-900">{summary.critical}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search alerts..."
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as "all" | "low" | "medium" | "high" | "critical")}
              className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "resolved")}
              className="h-11 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Card className="rounded-2xl border-0 bg-white p-6 text-sm text-slate-500 shadow-md">
            Loading alerts…
          </Card>
        ) : filteredAlerts.length === 0 ? (
          <Card className="rounded-2xl border-0 bg-white p-6 text-sm text-slate-500 shadow-md">
            {alerts.length === 0
              ? "No alerts found. Alerts will appear here when issues are detected."
              : "No alerts match your current filters."}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const severity = alert.severity;
              const type = alert.type;
              const SeverityIcon = severityConfig[severity].icon;
              const TypeIcon = typeConfig[type].icon;

              return (
                <Card key={alert._id} className="rounded-2xl border-0 bg-white p-6 shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${severityConfig[severity].color}`}>
                          <SeverityIcon className="h-5 w-5" />
                        </span>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{alert.title}</h3>
                            <Badge type={alert.status === "resolved" ? "success" : severity === "critical" ? "danger" : severity === "high" ? "warning" : "info"}>
                              {alert.status === "resolved" ? "Resolved" : severityConfig[severity].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">
                            {alert.repoName} • {formatTimeAgo(alert.createdAt)}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700">{alert.description}</p>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge type="secondary">
                          <TypeIcon className="mr-1 h-3 w-3" />
                          {typeConfig[type].label}
                        </Badge>
                        {alert.prNumber && (
                          <Badge type="secondary">
                            <GitPullRequest className="mr-1 h-3 w-3" />
                            PR #{alert.prNumber}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {alert.status === "active" && (
                        <Button variant="outline" size="sm" onClick={() => resolveAlert(alert._id)}>
                          Resolve
                        </Button>
                      )}
                      <Button variant="primary" size="sm">
                        View Details
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
