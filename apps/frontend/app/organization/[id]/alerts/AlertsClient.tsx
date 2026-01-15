"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { useUserStore } from "../../../../store/userStore";
import { Card } from "../../../../components/Ui/Card";
import { AlertCircle, CheckCircle, GitPullRequest, FileCode, TrendingUp } from "lucide-react";

interface Alert {
    _id: string;
    type: string;
    severity: "low" | "medium" | "high";
    metadata: any;
    createdAt: string;
    resolvedAt?: string | null;
}

export default function AlertsClient({ orgId }: { orgId: string }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "unresolved" | "resolved">("unresolved");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [alertToResolve, setAlertToResolve] = useState<string | null>(null);

    const user = useUserStore((state) => state.user);

    // Find users role in current org
    const currentOrg = user?.orgIds?.find((o: any) => String(o._id) === String(orgId));
    const userRole = currentOrg?.role || "VIEWER";
    const isAdmin = userRole === "ADMIN";

    const fetchAlerts = async () => {
        if (!orgId) return;
        try {
            setLoading(true);
            const res = await api.get(`/orgs/${orgId}/alerts`);
            setAlerts(res.data.data || []);
        } catch (error) {
            console.error("Alerts fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgId) fetchAlerts();
    }, [orgId]);

    const handleAcknowledge = async (alertId: string) => {
        setAlertToResolve(alertId);
        setShowConfirmModal(true);
    };

    const confirmResolve = async () => {
        if (!alertToResolve) return;
        try {
            setActiveId(alertToResolve);
            setShowConfirmModal(false);
            await api.post(`/orgs/${orgId}/alerts/${alertToResolve}/acknowledge`);
            await fetchAlerts();
        } catch (error) {
            console.error("Acknowledge failed", error);
            alert("Failed to acknowledge alert");
        } finally {
            setActiveId(null);
            setAlertToResolve(null);
        }
    };

    const cancelResolve = () => {
        setShowConfirmModal(false);
        setAlertToResolve(null);
    };

    const filteredAlerts = alerts.filter((alert) => {
        if (filter === "unresolved") return !alert.resolvedAt;
        if (filter === "resolved") return !!alert.resolvedAt;
        return true;
    });

    const unresolvedCount = alerts.filter((a) => !a.resolvedAt).length;
    const resolvedCount = alerts.filter((a) => !!a.resolvedAt).length;

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    <p className="text-xs sm:text-sm text-text-secondary animate-pulse">Loading alerts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <header>
                <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">Alerts</h1>
                <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                    Monitor and manage high-risk PRs and critical issues
                </p>
            </header>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
                <Card className="rounded-xl sm:rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-rose-900/20">
                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-text-secondary">Unresolved</p>
                            <p className="text-xl sm:text-2xl font-semibold text-text-primary">{unresolvedCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-xl sm:rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-text-secondary">Resolved</p>
                            <p className="text-xl sm:text-2xl font-semibold text-text-primary">{resolvedCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-xl sm:rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-text-secondary">Total</p>
                            <p className="text-xl sm:text-2xl font-semibold text-text-primary">{alerts.length}</p>
                        </div>
                    </div>
                </Card>
            </section>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-border">
                <button
                    onClick={() => setFilter("unresolved")}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 ${filter === "unresolved"
                        ? "border-brand text-brand"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                >
                    Unresolved ({unresolvedCount})
                </button>
                <button
                    onClick={() => setFilter("resolved")}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 ${filter === "resolved"
                        ? "border-brand text-brand"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                >
                    Resolved ({resolvedCount})
                </button>
                <button
                    onClick={() => setFilter("all")}
                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 ${filter === "all"
                        ? "border-brand text-brand"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                >
                    All ({alerts.length})
                </button>
            </div>

            {/* Alerts List */}
            <section>
                {filteredAlerts.length === 0 ? (
                    <Card className="rounded-xl sm:rounded-2xl border border-border bg-background p-8 sm:p-12 text-center shadow-sm">
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-surface">
                                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm sm:text-base font-medium text-text-primary">
                                    {filter === "unresolved" ? "No unresolved alerts" : filter === "resolved" ? "No resolved alerts" : "No alerts"}
                                </p>
                                <p className="mt-1 text-xs sm:text-sm text-text-secondary">
                                    {filter === "unresolved" ? "Great! Everything is under control." : "No alerts to show."}
                                </p>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-3 sm:space-y-4">
                        {filteredAlerts.map((alert) => {
                            const isHighRiskPR = alert.type === "high_risk_pr";
                            const metadata = alert.metadata || {};

                            return (
                                <Card
                                    key={alert._id}
                                    className={`rounded-xl sm:rounded-2xl border-l-4 ${alert.severity === "high"
                                        ? "border-l-red-500"
                                        : alert.severity === "medium"
                                            ? "border-l-orange-500"
                                            : "border-l-blue-500"
                                        } border border-border bg-background p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow ${alert.resolvedAt ? "opacity-60" : ""
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        {/* Alert Content */}
                                        <div className="flex-1 space-y-3">
                                            {/* Header */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                    {isHighRiskPR ? (
                                                        <GitPullRequest className="h-4 w-4 text-text-secondary" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-text-secondary" />
                                                    )}
                                                    <span className="text-xs sm:text-sm font-semibold text-text-primary">
                                                        {isHighRiskPR ? "High Risk Pull Request" : alert.type.replace(/_/g, " ").toUpperCase()}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${alert.severity === "high"
                                                        ? "bg-red-100 dark:bg-rose-900/30 text-red-700 dark:text-rose-400"
                                                        : alert.severity === "medium"
                                                            ? "bg-orange-100 dark:bg-amber-900/30 text-orange-700 dark:text-amber-400"
                                                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                                        }`}
                                                >
                                                    {alert.severity.toUpperCase()}
                                                </span>
                                                {alert.resolvedAt && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                        RESOLVED
                                                    </span>
                                                )}
                                            </div>

                                            {/* PR Details (for high_risk_pr type) */}
                                            {isHighRiskPR && (
                                                <div className="space-y-2">
                                                    <p className="text-sm sm:text-base font-medium text-text-primary">
                                                        #{metadata.prNumber}: {metadata.prTitle || "Untitled PR"}
                                                    </p>
                                                    <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-text-secondary">
                                                        <div className="flex items-center gap-1.5">
                                                            <FileCode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                            <span>{metadata.filesChanged || 0} files</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                            <span>{metadata.linesChanged || 0} lines</span>
                                                        </div>
                                                        {metadata.riskScore && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-semibold text-red-600 dark:text-rose-400">
                                                                    Risk: {Math.round(metadata.riskScore * 100)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {metadata.repoName && (
                                                        <p className="text-xs text-text-secondary">
                                                            Repository: <span className="font-mono">{metadata.repoName}</span>
                                                        </p>
                                                    )}
                                                    {metadata.author && (
                                                        <p className="text-xs text-text-secondary">
                                                            Author: <span className="font-medium">{metadata.author}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Generic metadata for other alert types */}
                                            {!isHighRiskPR && Object.keys(metadata).length > 0 && (
                                                <div className="text-xs sm:text-sm text-text-secondary space-y-1">
                                                    {Object.entries(metadata).slice(0, 3).map(([key, value]) => (
                                                        <p key={key}>
                                                            <span className="font-medium">{key}:</span> {String(value)}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <p className="text-[10px] sm:text-xs text-text-secondary">
                                                {alert.resolvedAt
                                                    ? `Resolved on ${new Date(alert.resolvedAt).toLocaleString()}`
                                                    : `Created on ${new Date(alert.createdAt).toLocaleString()}`}
                                            </p>
                                        </div>

                                        {/* Action Button */}
                                        {isAdmin && !alert.resolvedAt && (
                                            <button
                                                onClick={() => handleAcknowledge(alert._id)}
                                                disabled={activeId === alert._id}
                                                className="shrink-0 rounded-lg bg-emerald-600 dark:bg-emerald-500 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                            >
                                                {activeId === alert._id ? "Resolving..." : "Mark Resolved"}
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-text-primary">
                                    Mark Alert as Resolved?
                                </h3>
                                <p className="mt-2 text-sm text-text-secondary">
                                    This alert will be moved to the resolved section. You can still view it in the "Resolved" or "All" tabs.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                onClick={cancelResolve}
                                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface/80 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmResolve}
                                disabled={!!activeId}
                                className="rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                {activeId ? "Resolving..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
