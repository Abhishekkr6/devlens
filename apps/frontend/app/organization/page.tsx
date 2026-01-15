"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "../../lib/api";
import { useRouter } from "next/navigation";
import { Card } from "../../components/Ui/Card";
import { ConfirmDialog } from "../../components/Ui/ConfirmDialog";
import { useUserStore, Org } from "../../store/userStore";
import { useNotificationStore } from "../../store/notificationStore";
import { Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";

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

  // 🔥 NEW: Subscribe to notification store for real-time updates
  const notifications = useNotificationStore((s) => s.notifications);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);


  // Filter for invite notifications only
  const inviteNotifications = notifications.filter((n) => n.type === "invite" && !n.read);

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

  const notificationsFetched = useRef(false);

  useEffect(() => {
    fetchOrgs();

    // Fetch notifications when page loads (only once)
    if ((user?.id || user?._id) && !notificationsFetched.current) {
      console.log("[OrganizationPage] Fetching notifications...");
      useNotificationStore.getState().fetchNotifications();
      notificationsFetched.current = true;
    }
  }, [user?.id, user?._id]); // Removed fetchNotifications from deps

  // 🔥 DEBUG: Log when notifications change
  useEffect(() => {
    console.log("[OrganizationPage] Notifications updated:", {
      total: notifications.length,
      invites: inviteNotifications.length,
      inviteIds: inviteNotifications.map(n => n._id)
    });
  }, [notifications, inviteNotifications]);

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

  // Handle invite actions
  const handleAcceptInvite = async (notificationId: string, orgId: string) => {
    try {
      await api.post(`/orgs/${orgId}/invite/accept`);
      await fetchUser();
      await fetchOrgs();
      await deleteNotification(notificationId);
      toast.success("Invitation accepted");
    } catch (err) {
      console.error("Failed to accept invite", err);
      toast.error("Failed to accept invite");
    }
  };

  const handleRejectInvite = async (notificationId: string, orgId: string) => {
    try {
      await api.post(`/orgs/${orgId}/invite/reject`);
      await deleteNotification(notificationId);
      toast.info("Invitation rejected");
    } catch (err) {
      console.error("Failed to reject invite", err);
      toast.error("Failed to reject invite");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-200/50 dark:shadow-none">
            <svg className="w-6 h-6 text-white dark:text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Choose Organization</h1>
          <p className="mt-2 text-text-secondary">
            Select an existing organization or create a new one to get started.
          </p>
        </div>

        <div className="grid gap-6">
          {/* 🔥 NEW: Invite Notifications Section */}
          {inviteNotifications.length > 0 && (
            <div className="space-y-3">
              {inviteNotifications.map((notification) => (
                <Card key={notification._id} className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <span className="text-indigo-400 text-lg font-bold">+</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-text-primary mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRejectInvite(notification._id, notification.metadata?.orgId || "")}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary bg-background border border-border hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 hover:border-rose-500 transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAcceptInvite(notification._id, notification.metadata?.orgId || "")}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 transition-colors shadow-sm cursor-pointer"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Create Org Card */}
          <Card className="rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Create New Organization</h2>
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
              className="mt-6 w-full rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 px-4 py-3 text-sm font-bold text-white shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none cursor-pointer"
            >
              Create Organization
            </button>
          </Card>

          {/* List Orgs Card */}
          <Card className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Your Organizations</h2>

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
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-brand/40 hover:bg-brand/5 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="h-10 w-10 shrink-0 text-lg rounded-lg bg-background border border-border flex items-center justify-center font-bold text-text-secondary shadow-sm group-hover:border-brand/40 group-hover:text-brand">
                          {o.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-text-primary truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]" title={o.name}>
                            {o.name} <span className="text-xs font-normal text-text-secondary ml-1 whitespace-nowrap">{isOwner ? "(Owner)" : "(Member)"}</span>
                          </div>
                          <div className="text-xs text-text-secondary font-mono truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]" title={o.slug}>
                            {o.slug}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setActiveOrganization(o._id, o.slug);
                            router.push(`/organization/${o._id}/repos`);
                          }}
                          className="rounded-lg bg-background border border-border px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-text-secondary hover:border-brand hover:text-brand transition-colors shadow-sm cursor-pointer"
                        >
                          Launch
                        </button>

                        {/* Conditional Delete/Leave Button */}
                        {isOwner ? (
                          <button
                            onClick={() => setDeletingOrg(o)}
                            className="p-2 rounded-lg text-text-secondary hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-colors"
                            title="Delete Organization"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setLeavingOrg(o)}
                            className="p-2 rounded-lg text-text-secondary hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-colors"
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
        </div>
      </div>

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
