"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { useUserStore } from "../../../../store/userStore";
import { Card } from "../../../../components/Ui/Card";
import { AlertCircle, CheckCircle, GitPullRequest, FileCode, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-1 sm:space-y-2"
            >
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">Alerts</h1>
                <p className="mt-2 text-sm sm:text-base text-text-secondary font-light">
                    Monitor and manage high-risk PRs and critical issues
                </p>
            </motion.header>

            {/* Stats Cards */}
            <motion.section 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3"
            >
                <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-5 sm:p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-sm">
                            <AlertCircle className="h-6 w-6 text-rose-500 dark:text-rose-400" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-secondary">Unresolved</p>
                            <p className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary mt-0.5">{unresolvedCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-5 sm:p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                            <CheckCircle className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-secondary">Resolved</p>
                            <p className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary mt-0.5">{resolvedCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-5 sm:p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-sm">
                            <TrendingUp className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-secondary">Total</p>
                            <p className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary mt-0.5">{alerts.length}</p>
                        </div>
                    </div>
                </Card>
            </motion.section>

            {/* Filter Tabs */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex gap-2 sm:gap-4 border-b border-white/5"
            >
                <button
                    onClick={() => setFilter("unresolved")}
                    className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 ${filter === "unresolved"
                        ? "border-brand text-brand"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                >
                    Unresolved <span className="ml-1.5 inline-flex items-center justify-center bg-surface px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">{unresolvedCount}</span>
                </button>
                <button
                    onClick={() => setFilter("resolved")}
                    className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 ${filter === "resolved"
                        ? "border-emerald-500 text-emerald-500"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                >
                    Resolved <span className="ml-1.5 inline-flex items-center justify-center bg-surface px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">{resolvedCount}</span>
                </button>
                <button
                    onClick={() => setFilter("all")}
                    className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 ${filter === "all"
                        ? "border-text-primary text-text-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                        }`}
                >
                    All <span className="ml-1.5 inline-flex items-center justify-center bg-surface px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">{alerts.length}</span>
                </button>
            </motion.div>

            {/* Alerts List */}
            <section>
                <AnimatePresence mode="popLayout">
                {filteredAlerts.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                    <Card className="rounded-3xl border border-dashed border-white/10 bg-surface/30 p-10 sm:p-16 text-center shadow-none flex flex-col items-center justify-center">
                        <CheckCircle className="h-12 w-12 text-emerald-500/50 mb-4" />
                        <p className="text-base font-medium text-text-primary">
                            {filter === "unresolved" ? "No unresolved alerts" : filter === "resolved" ? "No resolved alerts" : "No alerts"}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary max-w-sm">
                            {filter === "unresolved" ? "Great job! Everything is under control." : "No alerts to show."}
                        </p>
                    </Card>
                    </motion.div>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {filteredAlerts.map((alert, i) => {
                            const isHighRiskPR = alert.type === "high_risk_pr";
                            const metadata = alert.metadata || {};

                            return (
                                <motion.div
                                    key={alert._id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                >
                                <Card
                                    className={`relative group overflow-hidden rounded-3xl border ${alert.severity === "high"
                                        ? "border-rose-500/30 hover:border-rose-500/60"
                                        : alert.severity === "medium"
                                            ? "border-amber-500/30 hover:border-amber-500/60"
                                            : "border-blue-500/30 hover:border-blue-500/60"
                                        } bg-surface/50 backdrop-blur-xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all ${alert.resolvedAt ? "opacity-60 saturate-50" : ""
                                        }`}
                                >
                                    {/* Left Accent Bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.severity === "high"
                                        ? "bg-rose-500"
                                        : alert.severity === "medium"
                                            ? "bg-amber-500"
                                            : "bg-blue-500"
                                        }`} />

                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 relative z-10 pl-2">
                                        {/* Alert Content */}
                                        <div className="flex-1 space-y-4">
                                            {/* Header */}
                                            <div className="flex flex-wrap items-center gap-3">
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
                                                    className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold border ${alert.severity === "high"
                                                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-sm"
                                                        : alert.severity === "medium"
                                                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm"
                                                            : "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-sm"
                                                        }`}
                                                >
                                                    {alert.severity.toUpperCase()}
                                                </span>
                                                {alert.resolvedAt && (
                                                    <span className="px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 shadow-sm text-emerald-500">
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
                                                className="shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/50 px-5 sm:px-6 py-2.5 text-sm font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
                                            >
                                                {activeId === alert._id ? "Resolving..." : "Mark Resolved"}
                                            </button>
                                        )}
                                    </div>
                                </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
                </AnimatePresence>
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
