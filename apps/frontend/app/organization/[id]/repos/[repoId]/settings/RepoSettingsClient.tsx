"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../../lib/api";
import { Card } from "../../../../../../components/Ui/Card";
import { ArrowLeft, AlertTriangle, Bell, Webhook, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../../../../../../components/Ui/ConfirmDialog";
import { useUserStore } from "../../../../../../store/userStore";

type RepoData = {
    id: string;
    name: string;
    url: string;
    health: "healthy" | "warning" | "attention";
    provider: string;
    updatedAt: string | null;
    settings?: {
        alertThresholds: {
            churnRate: number;
            openPRs: number;
            highRiskPRs: number;
            criticalAlerts: number;
        };
        notifications: {
            email: boolean;
            highRiskPRAlerts: boolean;
            criticalAlerts: boolean;
            weeklySummary: boolean;
        };
    };
};

export default function RepoSettingsClient({
    orgId,
    repoId,
}: {
    orgId: string;
    repoId: string;
}) {
    const router = useRouter();
    const user = useUserStore((state) => state.user);

    const [repo, setRepo] = useState<RepoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Settings state
    const [churnRateThreshold, setChurnRateThreshold] = useState(30);
    const [openPRsThreshold, setOpenPRsThreshold] = useState(10);
    const [highRiskPRsThreshold, setHighRiskPRsThreshold] = useState(3);
    const [criticalAlertsThreshold, setCriticalAlertsThreshold] = useState(1);

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [highRiskAlerts, setHighRiskAlerts] = useState(true);
    const [criticalAlerts, setCriticalAlerts] = useState(true);
    const [weeklySummary, setWeeklySummary] = useState(false);

    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Check if user is admin
    const currentOrg = user?.orgIds?.find((o: { _id?: string; role?: string }) => String(o._id) === String(orgId));
    const userRole = currentOrg?.role || "VIEWER";
    const isAdmin = userRole === "ADMIN";

    useEffect(() => {
        const fetchRepoData = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/orgs/${orgId}/repos/${repoId}`);
                const repoData = res.data.data.repo;
                setRepo(repoData);

                // Load settings from API response
                if (repoData.settings) {
                    setChurnRateThreshold(repoData.settings.alertThresholds.churnRate);
                    setOpenPRsThreshold(repoData.settings.alertThresholds.openPRs);
                    setHighRiskPRsThreshold(repoData.settings.alertThresholds.highRiskPRs);
                    setCriticalAlertsThreshold(repoData.settings.alertThresholds.criticalAlerts);

                    setEmailNotifications(repoData.settings.notifications.email);
                    setHighRiskAlerts(repoData.settings.notifications.highRiskPRAlerts);
                    setCriticalAlerts(repoData.settings.notifications.criticalAlerts);
                    setWeeklySummary(repoData.settings.notifications.weeklySummary);
                }
            } catch (err: unknown) {
                console.error("Failed to fetch repo data", err);
                if (typeof err === "object" && err !== null && "response" in err) {
                    setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to load repository");
                } else {
                    setError("Failed to load repository");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRepoData();
    }, [orgId, repoId]);

    const handleSaveSettings = async () => {
        if (!isAdmin) return;

        try {
            setIsSaving(true);
            await api.patch(`/orgs/${orgId}/repos/${repoId}/settings`, {
                alertThresholds: {
                    churnRate: churnRateThreshold,
                    openPRs: openPRsThreshold,
                    highRiskPRs: highRiskPRsThreshold,
                    criticalAlerts: criticalAlertsThreshold,
                },
                notifications: {
                    email: emailNotifications,
                    highRiskPRAlerts: highRiskAlerts,
                    criticalAlerts: criticalAlerts,
                    weeklySummary: weeklySummary,
                },
            });

            alert("Settings saved successfully!");
        } catch (err: unknown) {
            console.error("Failed to save settings", err);
            if (typeof err === "object" && err !== null && "response" in err) {
                alert((err as { response?: { data?: { error?: string } } }).response?.data?.error || "Failed to save settings");
            } else {
                alert("Failed to save settings");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDisconnectRepo = async () => {
        if (!isAdmin) return;

        try {
            setIsDeleting(true);
            await api.delete(`/orgs/${orgId}/repos/${repoId}`);
            router.push(`/organization/${orgId}/repos`);
        } catch (err) {
            console.error("Failed to disconnect repository", err);
            alert("Failed to disconnect repository");
        } finally {
            setIsDeleting(false);
            setShowDisconnectDialog(false);
        }
    };

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

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="space-y-6 animate-pulse">
                    <div className="w-64 h-8 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} className="p-6 border rounded-2xl border-border bg-background">
                                <div className="h-40 rounded bg-slate-100 dark:bg-slate-800" />
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !repo) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-sm text-text-secondary">{error || "Repository not found"}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium border cursor-pointer rounded-xl border-border text-text-primary hover:bg-surface"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const healthBadge = getHealthBadge(repo.health);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => router.push(`/organization/${orgId}/repos/${repoId}`)}
                    className="flex items-center gap-2 text-sm cursor-pointer text-text-secondary hover:text-text-primary w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Repository
                </button>

                <div>
                    <h1 className="mb-1 text-2xl font-semibold sm:text-3xl text-text-primary">
                        Repository Settings
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Configure alerts, notifications, and manage {repo.name}
                    </p>
                </div>
            </div>

            {/* General Settings */}
            <Card className="p-6 border shadow-sm rounded-2xl border-border bg-background">
                <h2 className="mb-4 text-lg font-semibold text-text-primary">General Settings</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-text-secondary">Repository Name</label>
                            <div className="mt-1 text-sm font-medium text-text-primary">{repo.name}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-text-secondary">Health Status</label>
                            <div className="mt-1">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${healthBadge.className}`}>
                                    {healthBadge.text}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Repository URL</label>
                        <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-1 text-sm text-brand hover:text-brand/80"
                        >
                            {repo.url}
                        </a>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary">Last Updated</label>
                        <div className="mt-1 text-sm text-text-primary">
                            {repo.updatedAt ? new Date(repo.updatedAt).toLocaleString() : "Never"}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Alert Configuration */}
            <Card className="p-6 border shadow-sm rounded-2xl border-border bg-background">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 border rounded-lg border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-text-primary">Alert Configuration</h2>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-text-primary">
                            Churn Rate Threshold: {churnRateThreshold}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={churnRateThreshold}
                            onChange={(e) => setChurnRateThreshold(Number(e.target.value))}
                            className="w-full h-2 border rounded-lg appearance-none cursor-pointer bg-surface accent-brand border-border"
                            disabled={!isAdmin}
                            title="Churn Rate Threshold"
                        />
                        <p className="mt-1 text-xs text-text-secondary">
                            Alert when code churn rate exceeds this percentage
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-text-primary">
                                Open PRs Threshold
                            </label>
                            <input
                                type="number"
                                value={openPRsThreshold}
                                onChange={(e) => setOpenPRsThreshold(Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm border rounded-xl border-border bg-background focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                                min="1"
                                disabled={!isAdmin}
                                placeholder="Enter open PRs threshold"
                            />
                            <p className="mt-1 text-xs text-text-secondary">Alert when open PRs exceed this count</p>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-text-primary">
                                High Risk PRs Threshold
                            </label>
                            <input
                                type="number"
                                value={highRiskPRsThreshold}
                                onChange={(e) => setHighRiskPRsThreshold(Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm border rounded-xl border-border bg-background focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                                min="1"
                                disabled={!isAdmin}
                                placeholder="Enter high-risk PRs threshold"
                            />
                            <p className="mt-1 text-xs text-text-secondary">Alert when high-risk PRs exceed this count</p>
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-text-primary">
                                Critical Alerts Threshold
                            </label>
                            <input
                                type="number"
                                value={criticalAlertsThreshold}
                                onChange={(e) => setCriticalAlertsThreshold(Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm border rounded-xl border-border bg-background focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                                min="1"
                                disabled={!isAdmin}
                                placeholder="Enter critical alerts threshold"
                            />
                            <p className="mt-1 text-xs text-text-secondary">Alert when critical alerts exceed this count</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Notification Preferences */}
            <Card className="p-6 border shadow-sm rounded-2xl border-border bg-background">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 border border-blue-200 rounded-lg dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                        <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-text-primary">Notification Preferences</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-text-primary">Email Notifications</div>
                            <div className="text-xs text-text-secondary">Receive email notifications for repository events</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={emailNotifications}
                                onChange={(e) => setEmailNotifications(e.target.checked)}
                                className="sr-only peer"
                                disabled={!isAdmin}
                                title="Email Notifications"
                            />
                            <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-text-primary">High-Risk PR Alerts</div>
                            <div className="text-xs text-text-secondary">Get notified when high-risk PRs are created</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={highRiskAlerts}
                                onChange={(e) => setHighRiskAlerts(e.target.checked)}
                                className="sr-only peer"
                                disabled={!isAdmin}
                                title="High-Risk PR Alerts"
                            />
                            <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-text-primary">Critical Alerts</div>
                            <div className="text-xs text-text-secondary">Get notified immediately for critical issues</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={criticalAlerts}
                                onChange={(e) => setCriticalAlerts(e.target.checked)}
                                className="sr-only peer"
                                disabled={!isAdmin}
                                title="Critical Alerts"
                            />
                            <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-text-primary">Weekly Summary</div>
                            <div className="text-xs text-text-secondary">Receive weekly repository activity summary</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={weeklySummary}
                                onChange={(e) => setWeeklySummary(e.target.checked)}
                                className="sr-only peer"
                                disabled={!isAdmin}
                                title="Weekly Summary"
                            />
                            <div className="w-11 h-6 bg-surface peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Webhook Status */}
            <Card className="p-6 border shadow-sm rounded-2xl border-border bg-background">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 border border-purple-200 rounded-lg dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                        <Webhook className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-text-primary">Webhook Status</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-text-primary">Connection Status</div>
                            <div className="mt-1 text-xs text-text-secondary">
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Connected
                                </span>
                            </div>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium border cursor-pointer rounded-xl border-border text-text-primary hover:bg-surface">
                            Test Webhook
                        </button>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-text-primary">Last Event</div>
                        <div className="mt-1 text-xs text-text-secondary">
                            {repo.updatedAt ? new Date(repo.updatedAt).toLocaleString() : "No events received"}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            {isAdmin && (
                <div className="flex justify-end">
                    <button
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="px-6 py-2 text-sm font-semibold text-white border cursor-pointer rounded-xl border-brand bg-brand hover:bg-brand/90 disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Settings"}
                    </button>
                </div>
            )}

            {/* Danger Zone */}
            {isAdmin && (
                <Card className="p-6 border border-red-200 shadow-sm rounded-2xl dark:border-red-900 bg-red-50 dark:bg-red-950/20">
                    <div className="flex items-center gap-2 mb-4">
                        <Trash2 className="w-5 h-5 text-red-600" />
                        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-red-700 dark:text-red-400">Disconnect Repository</div>
                                <div className="mt-1 text-xs text-red-600 dark:text-red-500">
                                    Remove this repository from DevLens. All data will be deleted.
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDisconnectDialog(true)}
                                className="px-4 py-2 text-sm font-medium text-red-600 transition-colors border border-red-600 cursor-pointer rounded-xl hover:bg-red-600 hover:text-white"
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Disconnect Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDisconnectDialog}
                onClose={() => setShowDisconnectDialog(false)}
                onConfirm={handleDisconnectRepo}
                title="Disconnect Repository"
                description={`Are you sure you want to disconnect "${repo.name}"? This will remove all analyzed data, including commits, PRs, and alerts from DevLens. The actual GitHub repository will not be affected.`}
                confirmText="Disconnect Repository"
                isLoading={isDeleting}
            />
        </div>
    );
}
