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

export default function AlertsClient({ orgId }: { orgId: string }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);

    const user = useUserStore((state) => state.user);

    // Find users role in current org
    const currentOrg = user?.orgIds?.find((o) => String(o.id) === String(orgId));
    const userRole = currentOrg?.role || "VIEWER";
    const isAdmin = userRole === "ADMIN";

    const fetchAlerts = async () => {
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
        if (!confirm("Mark this alert as resolved?")) return;
        try {
            setActiveId(alertId);
            await api.post(`/orgs/${orgId}/alerts/${alertId}/acknowledge`);
            // Refresh list
            await fetchAlerts();
        } catch (error) {
            console.error("Acknowledge failed", error);
            alert("Failed to acknowledge alert");
        } finally {
            setActiveId(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading alerts...</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-semibold text-slate-900">Alerts</h1>
                </div>

                {alerts.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-slate-500">No active alerts. Good job!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <Card key={alert._id} className="p-4 border-l-4 border-l-red-500 bg-white shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 uppercase text-xs tracking-wider">{alert.type}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                                                alert.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {alert.severity}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {JSON.stringify(alert.metadata)}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-400">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {isAdmin && (
                                        <button
                                            onClick={() => handleAcknowledge(alert._id)}
                                            disabled={activeId === alert._id}
                                            className="text-xs font-medium text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
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
