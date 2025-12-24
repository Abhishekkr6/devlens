"use client";

import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card } from "@/components/Ui/Card";
import React from "react";

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = React.use(params);
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <header>
                    <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
                    <p className="mt-1 text-sm text-slate-500">Manage your organization preferences</p>
                </header>

                <Card className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm text-slate-500 shadow-none">
                    Organization settings are coming soon. You can manage repositories and team members in their respective tabs.
                </Card>
            </div>
        </DashboardLayout>
    );
}
