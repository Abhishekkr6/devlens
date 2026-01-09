"use client";

import { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { useUserStore } from "../../../../store/userStore";
import { Card } from "../../../../components/Ui/Card";

interface Alert {
    _id: string;
    type: string;
    severity: "low" | "medium" | "high";
    metadata: any;
    createdAt: string;
}

export default function AlertsClient({ orgSlug, orgId: propOrgId }: { orgSlug?: string; orgId?: string }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);

    const user = useUserStore((state) => state.user);

    // Convert slug to orgId using userStore
    const orgId = orgSlug ? user?.orgIds?.find(o => o.slug === orgSlug)?._id : propOrgId;

    // Find users role in current org
    const currentOrg = user?.orgIds?.find((o) => String(o._id) === String(orgId));
    const userRole = currentOrg?.role || "VIEWER";
    const isAdmin = userRole === "ADMIN";

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/orgs/slug/${orgSlug}/alerts`);
            setAlerts(res.data.data || []);
        } catch (error) {
            console.error("Alerts fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orgSlug) fetchAlerts();
    }, [orgSlug]);

    const handleAcknowledge = async (alertId: string) => {
        if (!confirm("Mark this alert as resolved?")) return;
        try {
            setActiveId(alertId);
            await api.post(`/orgs/slug/${orgSlug}/alerts/${alertId}/acknowledge`);
            // Refresh list
            await fetchAlerts();
        } catch (error) {
            console.error("Acknowledge failed", error);
            alert("Failed to acknowledge alert");
        } finally {
            setActiveId(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-text-secondary">Loading alerts...</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-text-primary">Alerts</h1>
                </div>

                {alerts.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-background p-12 text-center shadow-sm">
                        <p className="text-text-secondary">No active alerts. Good job!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <Card key={alert._id} className="p-4 border-l-4 border-l-red-500 bg-background shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-text-primary uppercase text-xs tracking-wider">{alert.type}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${alert.severity === 'high' ? 'bg-red-100 dark:bg-rose-900/30 text-red-700 dark:text-rose-400' :
                                                alert.severity === 'medium' ? 'bg-orange-100 dark:bg-amber-900/30 text-orange-700 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                }`}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-text-secondary">
                                            {JSON.stringify(alert.metadata)}
                                        </p>
                                        <p className="mt-2 text-xs text-text-secondary">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {isAdmin && (
                                        <button
                                            onClick={() => handleAcknowledge(alert._id)}
                                            disabled={activeId === alert._id}
                                            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 disabled:opacity-50"
                                        >
                                            {activeId === alert._id ? "Resolving..." : "Mark Resolved"}
                                        </button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
