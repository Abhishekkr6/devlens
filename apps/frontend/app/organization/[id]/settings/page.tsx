"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card } from "@/components/Ui/Card";
import { Button } from "@/components/Ui/Button";
import { AISettingsPanel } from "@/components/Settings/AISettingsPanel";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: orgId } = use(params);
    const router = useRouter();
    const { user, fetchUser, setActiveOrganization } = useUserStore();

    const [loading, setLoading] = useState(true);
    const [orgData, setOrgData] = useState<{ createdBy: string; orgName: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchOrgDetails = async () => {
            try {
                // leveraging getOrgMembers to get org details including createdBy
                const res = await api.get(`/orgs/${orgId}/members`);
                if (res.data?.success) {
                    setOrgData(res.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch org details", err);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };

        if (orgId && user) {
            fetchOrgDetails();
        }
    }, [orgId, user]);

    // Robust check for owner
    const userId = user?.id || user?._id;
    const isOwner = userId && orgData?.createdBy && String(userId) === String(orgData.createdBy);

    const handleDeleteOrg = async () => {
        if (deleteConfirm !== orgData?.orgName) {
            toast.error("Organization name does not match");
            return;
        }

        try {
            setIsDeleting(true);
            await api.delete(`/orgs/${orgId}`);
            toast.success("Organization deleted successfully");

            // Refresh user to clear deleted org from state
            await fetchUser();
            setActiveOrganization(""); // Clear active org
            router.push("/organization");
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || "Failed to delete organization");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-4xl">
                <header>
                    <h1 className="text-3xl font-semibold text-text-primary">Settings</h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Manage settings for <span className="font-medium text-text-primary">{orgData?.orgName}</span>
                    </p>
                    {/* Debug info (hidden in production) */}
                    {/* <div className="text-xs text-text-secondary hidden">
                        User: {String(userId)} | Creator: {String(orgData?.createdBy)} | IsOwner: {String(isOwner)}
                    </div> */}
                </header>

                <div className="space-y-6">
                    {/* AI Settings */}
                    <Card className="p-6">
                        <AISettingsPanel />
                    </Card>

                    {/* Danger Zone - OWNER ONLY */}
                    {isOwner && (
                        <div className="rounded-xl border border-red-500/30 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                            <div className="px-6 py-4 border-b border-red-500/30 bg-red-500/10">
                                <h2 className="text-base font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Danger Zone
                                </h2>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-white">Delete Organization</h3>
                                        <p className="text-sm text-zinc-300 mt-1">
                                            This action cannot be undone. All repositories, members, and data associated with this organization will be permanently deleted.
                                        </p>
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        <div className="space-y-3">
                                            <p className="text-xs text-zinc-300">
                                                Type <strong>{orgData?.orgName}</strong> to confirm:
                                            </p>
                                            <input
                                                type="text"
                                                value={deleteConfirm}
                                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-red-500/30 rounded-lg bg-black/20 text-white placeholder:text-zinc-500 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                                                placeholder="Organization Name"
                                            />
                                            <Button
                                                variant="destructive"
                                                className="w-full sm:w-auto"
                                                disabled={deleteConfirm !== orgData?.orgName || isDeleting}
                                                onClick={handleDeleteOrg}
                                            >
                                                {isDeleting ? "Deleting..." : (
                                                    <>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Organization
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
