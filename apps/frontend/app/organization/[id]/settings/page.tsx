"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card } from "@/components/Ui/Card";
import { Button } from "@/components/Ui/Button";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import { AlertTriangle, LogOut, Trash2 } from "lucide-react";

export default function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: orgId } = use(params);
    const router = useRouter();
    const { user, fetchUser, setActiveOrganization } = useUserStore();

    const [loading, setLoading] = useState(true);
    const [orgData, setOrgData] = useState<{ createdBy: string; orgName: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

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

    const isOwner = user && orgData && String(user.id || user._id) === String(orgData.createdBy);

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
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || "Failed to delete organization");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLeaveOrg = async () => {
        if (!confirm("Are you sure you want to leave this organization?")) return;

        try {
            setIsLeaving(true);
            await api.delete(`/orgs/${orgId}/leave`);
            toast.success("You have left the organization");

            await fetchUser();
            setActiveOrganization("");
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.response?.data?.error?.message || "Failed to leave organization");
        } finally {
            setIsLeaving(false);
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
                </header>

                <div className="space-y-6">
                    {/* General Settings Placeholder */}
                    <Card className="p-6">
                        <h2 className="text-lg font-medium text-text-primary mb-4">General</h2>
                        <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                            <p className="text-sm text-text-secondary">
                                General settings (name, slug, logo) coming soon.
                            </p>
                        </div>
                    </Card>

                    {/* Danger Zone */}
                    <div className="rounded-xl border border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/10 overflow-hidden">
                        <div className="px-6 py-4 border-b border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-950/20">
                            <h2 className="text-base font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Danger Zone
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {isOwner ? (
                                // DELETE ORG (Owner Only)
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-text-primary">Delete Organization</h3>
                                        <p className="text-sm text-text-secondary mt-1">
                                            This action cannot be undone. All repositories, members, and data associated with this organization will be permanently deleted.
                                        </p>
                                    </div>
                                    <div className="w-full sm:w-auto">
                                        {/* Simple confirmation flow for demo purposes */}
                                        <div className="space-y-3">
                                            <p className="text-xs text-text-secondary">
                                                Type <strong>{orgData?.orgName}</strong> to confirm:
                                            </p>
                                            <input
                                                type="text"
                                                value={deleteConfirm}
                                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
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
                            ) : (
                                // LEAVE ORG (Non-Owners)
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-text-primary">Leave Organization</h3>
                                        <p className="text-sm text-text-secondary mt-1">
                                            You will lose access to all repositories and resources. You can only rejoin if invited again.
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        className="shrink-0"
                                        onClick={handleLeaveOrg}
                                        disabled={isLeaving}
                                    >
                                        {isLeaving ? "Leaving..." : (
                                            <>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Leave Organization
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
