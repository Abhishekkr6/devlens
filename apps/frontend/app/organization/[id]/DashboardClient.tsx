"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useUserStore } from "../../../store/userStore";
import { Card } from "../../../components/Ui/Card";
import CommitLineChart from "../../../components/Charts/CommitLineChart";
import PRRiskBarChart from "../../../components/Charts/PRRiskBarChart";

interface DashboardData {
    kpis: {
        commits: number;
        activeDevs: number;
        openPRs: number;
        avgPRTimeHours: number;
    };
    charts: {
        commitTimeline: { date: string; commitCount: number }[];
        prVelocity: { date: string; opened: number; merged: number }[];
        contributorBreakdown: { name: string; commits: number }[];
    };
}

export default function DashboardClient({ orgId }: { orgId: string }) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const activeOrgId = useUserStore((state) => state.activeOrgId);
    const currentOrgId = orgId || activeOrgId;

    useEffect(() => {
        if (!currentOrgId) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/orgs/${currentOrgId}/dashboard`);
                setData(res.data.data);
            } catch (error) {
                console.error("Dashboard fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentOrgId]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    if (!data) return <div className="p-8 text-center text-slate-500">No data available</div>;

    // Adapters for charts
    const commitChartData = data.charts.commitTimeline.map((d) => ({
        _id: d.date,
        total: d.commitCount,
    }));

    // PR Risk Chart expects specific format? Let's assume standard bar chart for now.
    // Actually PRRiskBarChart likely expects risk distribution.
    // My backend returns velocity (opened vs merged).
    // I will just disable PRRiskBarChart for now if data doesn't match, or map velocity to it if it's generic.

    return (
        <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Total Commits (7d)" value={data.kpis.commits} />
                <KpiCard title="Active Developers" value={data.kpis.activeDevs} />
                <KpiCard title="Open PRs" value={data.kpis.openPRs} />
                <KpiCard title="Avg PR Merge Time" value={`${data.kpis.avgPRTimeHours}h`} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="p-6 bg-white shadow-sm border-slate-200">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">Commit Activity</h3>
                    <CommitLineChart data={commitChartData} />
                </Card>

                <Card className="p-6 bg-white shadow-sm border-slate-200">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800">Top Contributors</h3>
                    <div className="space-y-3">
                        {data.charts.contributorBreakdown.map((c, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">{c.name}</span>
                                <span className="text-sm font-bold text-indigo-600">{c.commits} commits</span>
                            </div>
                        ))}
                        {data.charts.contributorBreakdown.length === 0 && (
                            <p className="text-sm text-slate-400">No contributor data</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function KpiCard({ title, value }: { title: string; value: string | number }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}
