"use client";

import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { useRouter } from "next/navigation";
import { Card } from "../../components/Ui/Card";
import { ConfirmDialog } from "../../components/Ui/ConfirmDialog";
import { useUserStore, Org } from "../../store/userStore";
import { useNotificationStore } from "../../store/notificationStore";
import { Trash2, LogOut, LayoutDashboard, Plus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function OrganizationPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState<Org | null>(null);
  const [leavingOrg, setLeavingOrg] = useState<Org | null>(null); // New state for leave confirmation
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [slugError, setSlugError] = useState("");

  const router = useRouter();
  const { setActiveOrganization, user, fetchUser } = useUserStore();

  // 🔥 Notification store - DISABLED (now using top-right toast)
  // const notifications = useNotificationStore((s) => s.notifications);
  // const deleteNotification = useNotificationStore((s) => s.deleteNotification);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  // Filter for invite notifications only - DISABLED
  // const inviteNotifications = notifications.filter((n) => n.type === "invite" && !n.read);


  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orgs");
      setOrgs(res.data.data || []);
    } catch (e) {
      console.error("Failed to load organizations", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();

    // Fetch notifications when page loads
    if (user?.id || user?._id) {

      fetchNotifications();
    }
  }, [user?.id, user?._id, fetchNotifications]);

  const validateName = (value: string): string => {
    if (!value.trim()) {
      return "Organization name is required";
    }
    return "";
  };

  const validateSlug = (value: string): string => {
    if (!value.trim()) {
      return "Slug URL is required";
    }
    // Check for uppercase letters
    if (/[A-Z]/.test(value)) {
      return "Slug must be lowercase only";
    }
    // Check for spaces
    if (/\s/.test(value)) {
      return "Slug cannot contain spaces";
    }
    // Check for invalid characters (only allow lowercase letters, numbers, and hyphens)
    if (!/^[a-z0-9-]+$/.test(value)) {
      return "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    return "";
  };

  const createOrg = async () => {
    // Clear previous errors
    setNameError("");
    setSlugError("");

    // Validate inputs
    const nameValidationError = validateName(name);
    const slugValidationError = validateSlug(slug);

    if (nameValidationError || slugValidationError) {
      setNameError(nameValidationError);
      setSlugError(slugValidationError);
      return;
    }

    try {
      const res = await api.post("/orgs", { name, slug });
      const { org, defaultOrgId } = res.data.data;

      const activeOrgId = defaultOrgId ?? org?._id;
      if (!org?._id || !activeOrgId) {
        throw new Error("Invalid organization response");
      }

      setActiveOrganization(activeOrgId.toString());
      await fetchOrgs();
      // Reset form
      setName("");
      setSlug("");
      toast.success(`Organization "${org.name}" created successfully`);
    } catch (err: unknown) {
      console.error("Failed to create organization", err);
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };

      // Handle backend errors
      const errorMessage = e.response?.data?.error?.message || "Failed to create organization";

      // Check if it's a duplicate slug error
      if (errorMessage.toLowerCase().includes("slug already exists") ||
        errorMessage.toLowerCase().includes("duplicate")) {
        setSlugError("This slug is already taken");
      } else if (errorMessage.toLowerCase().includes("name")) {
        setNameError(errorMessage);
      } else if (errorMessage.toLowerCase().includes("slug")) {
        setSlugError(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrg) return;

    try {
      setIsDeleting(true);
      await api.delete(`/orgs/${deletingOrg._id}`);
      setOrgs((prev) => prev.filter((o) => o._id !== deletingOrg._id));
      setDeletingOrg(null);
      toast.success("Organization deleted successfully");
      await fetchUser(); // Ensure global state is updated
    } catch (err: unknown) {
      console.error("Failed to delete organization", err);
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      toast.error(e.response?.data?.error?.message || "Failed to delete organization");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmLeave = async () => {
    if (!leavingOrg) return;

    try {
      setIsLeaving(true);
      await api.delete(`/orgs/${leavingOrg._id}/leave`);
      setOrgs((prev) => prev.filter((o) => o._id !== leavingOrg._id));
      setLeavingOrg(null);
      toast.success("You have left the organization");
      await fetchUser();
    } catch (err: unknown) {
      console.error("Failed to leave organization", err);
      const e = err as { response?: { data?: { error?: { message?: string } } }; message?: string };
      toast.error(e.response?.data?.error?.message || "Failed to leave organization");
    } finally {
      setIsLeaving(false);
    }
  }

  const disabled = !name.trim() || !slug.trim();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Absolute Ambient Background Lights for Premium Dashboard Vibe */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-2xl space-y-6 sm:space-y-8 z-10"
      >
        <div className="text-center">
          <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-surface border border-white/10 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shadow-xl relative group">
            <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <LayoutDashboard className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-brand relative z-10" />
          </div>
          <h1 className="text-2xl xs:text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">Choose Organization</h1>
          <p className="mt-2 sm:mt-3 text-text-secondary text-sm sm:text-base md:text-lg font-light max-w-md mx-auto">
            Select an existing organization or create a new one to get started.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Create Org Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg hover:border-brand/30 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-brand/10 p-2 rounded-xl border border-brand/20">
                    <Plus className="w-5 h-5 text-brand" />
                  </div>
                  <h2 className="text-xl font-bold text-text-primary">Create New Organization</h2>
                </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Organization Name</label>
                <input
                  className={`w-full rounded-xl border ${nameError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-brand focus:ring-brand'} bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:ring-1 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                  placeholder="e.g. Acme Inc"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                />
                {nameError && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{nameError}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Slug URL</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-text-secondary text-sm">/</span>
                  <input
                    className={`w-full rounded-xl border ${slugError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-800 focus:border-brand focus:ring-brand'} bg-slate-50 dark:bg-slate-900 pl-7 pr-4 py-2.5 text-sm outline-none focus:ring-1 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500`}
                    placeholder="acme-inc"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      if (slugError) setSlugError("");
                    }}
                  />
                </div>
                {slugError && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{slugError}</p>
                )}
              </div>
            </div>
            <button
              onClick={createOrg}
              disabled={disabled}
              className="mt-5 w-full rounded-2xl bg-text-primary text-background hover:bg-slate-200 px-4 py-3 sm:py-3.5 text-sm sm:text-base font-bold shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none cursor-pointer"
            >
              Create Organization
            </button>
              </div>
            </Card>
          </motion.div>

          {/* List Orgs Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden">
              <h2 className="text-xl font-bold text-text-primary mb-6">Your Organizations</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : orgs.length === 0 ? (
              <div className="text-center py-8 bg-surface rounded-xl border border-dashed border-border">
                <p className="text-sm text-text-secondary">No organizations found. Create one above!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {orgs.map((o) => {
                  const isOwner = o.role === "ADMIN";
                  return (
                    <li
                      key={o._id}
                      className="group flex flex-col xs:flex-row xs:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-surface/40 p-4 transition-all hover:border-brand/40 hover:bg-brand/5 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="h-12 w-12 shrink-0 text-xl rounded-xl bg-background border border-border flex items-center justify-center font-bold text-text-secondary shadow-sm group-hover:border-brand/40 group-hover:text-brand transition-colors duration-300">
                          {o.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-base text-text-primary truncate" title={o.name}>
                            {o.name} <span className="text-xs font-normal text-text-secondary ml-1 whitespace-nowrap bg-surface px-2 py-0.5 rounded-full">{isOwner ? "Owner" : "Member"}</span>
                          </div>
                          <div className="text-sm text-text-secondary font-mono truncate mt-0.5" title={o.slug}>
                            {o.slug}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-15 xs:ml-0">
                        <button
                          onClick={() => {
                            setActiveOrganization(o._id, o.slug);
                            router.push(`/organization/${o._id}/repos`);
                          }}
                          className="flex-1 xs:flex-none rounded-xl bg-surface border border-border hover:border-brand/40 px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary hover:shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          Launch
                        </button>

                        {/* Conditional Delete/Leave Button */}
                        {isOwner ? (
                          <button
                            onClick={() => setDeletingOrg(o)}
                            className="p-2.5 rounded-xl text-text-secondary hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 border border-transparent transition-all"
                            title="Delete Organization"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setLeavingOrg(o)}
                            className="p-2.5 rounded-xl text-text-secondary hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 border border-transparent transition-all"
                            title="Leave Organization"
                          >
                            <LogOut className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={!!deletingOrg}
        onClose={() => setDeletingOrg(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Organization"
        description={`Are you sure you want to delete "${deletingOrg?.name}"? This action cannot be undone and will permanently delete all data associated with this organization.`}
        confirmText="Delete Organization"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={!!leavingOrg}
        onClose={() => setLeavingOrg(null)}
        onConfirm={handleConfirmLeave}
        title="Leave Organization"
        description={`Are you sure you want to leave "${leavingOrg?.name}"? You will lose access to all repositories and resources.`}
        confirmText="Leave Organization"
        isLoading={isLeaving}
      />
    </div>
  );
}
