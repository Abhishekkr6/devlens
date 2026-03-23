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
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchOrgDetails = async () => {
            try {
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

    const userId = user?.id || user?._id;
    const isOwner = userId && orgData?.createdBy && String(userId) === String(orgData.createdBy);

    const handleDeleteOrg = async () => {
        if (confirmText !== orgData?.orgName) {
            toast.error("Organization name does not match");
            return;
        }

        try {
            setIsDeleting(true);
            await api.delete(`/orgs/${orgId}`);
            toast.success("Organization deleted successfully");

            await fetchUser();
            setActiveOrganization("");
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
            <div className="space-y-8 max-w-4xl relative z-10">
                {/* Background Glows */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand/10 to-transparent -z-10 rounded-3xl blur-3xl pointer-events-none" />

                <header className="border-b border-white/10 pb-6 relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Organization Settings</h1>
                    <p className="mt-2 text-base text-text-secondary font-medium">
                        Manage configuration and preferences for {orgData?.orgName ? <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded-md border border-white/10 ml-1 shadow-sm">{orgData?.orgName}</span> : <span className="animate-pulse bg-white/10 h-5 w-24 inline-block rounded-md ml-1" />}
                    </p>
                </header>

                <div className="space-y-8 relative z-10">
                    <Card className="p-0 overflow-hidden border border-white/10 bg-surface/40 backdrop-blur-xl shadow-2xl rounded-2xl">
                        <div className="p-6 sm:p-8">
                            <AISettingsPanel />
                        </div>
                    </Card>

                    {isOwner && (
                        <div className="rounded-2xl border border-red-500/20 bg-surface/40 backdrop-blur-xl overflow-hidden shadow-2xl relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none opacity-50" />
                            <div className="px-6 sm:px-8 py-5 border-b border-red-500/20 bg-red-500/10 relative z-10 flex items-center gap-3">
                                <div className="p-2 bg-red-500/20 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">
                                        Danger Zone
                                    </h2>
                                    <p className="text-xs text-red-300 font-medium">Irreversible and destructive actions</p>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                    <div className="flex-1 pr-0 sm:pr-8">
                                        <h3 className="text-base font-bold text-white">Delete Organization</h3>
                                        <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                                            This action is <strong className="text-red-400">permanent and cannot be undone</strong>. All repositories, team members, pull request intelligence, and data associated with this organization will be permanently deleted from DevLens.
                                        </p>
                                    </div>
                                    <div className="w-full sm:w-[320px] shrink-0 bg-black/20 p-5 rounded-xl border border-white/5 shadow-inner">
                                        <div className="space-y-4">
                                            <label className="text-xs text-text-secondary font-medium block">
                                                Please type <strong className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded select-all">{orgData?.orgName}</strong> to confirm:
                                            </label>
                                            <input
                                                type="text"
                                                value={confirmText}
                                                onChange={(e) => setConfirmText(e.target.value)}
                                                className="w-full px-4 py-3 text-sm border border-red-500/30 rounded-xl bg-black/40 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none shadow-inner"
                                                placeholder={orgData?.orgName || "Organization Name"}
                                                autoComplete="off"
                                            />
                                            <Button
                                                variant="destructive"
                                                className="w-full py-6 rounded-xl font-bold shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all disabled:opacity-50 disabled:shadow-none"
                                                disabled={confirmText !== orgData?.orgName || isDeleting}
                                                onClick={handleDeleteOrg}
                                            >
                                                {isDeleting ? "Deleting Permanently..." : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete Organization
                                                    </span>
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
