"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../lib/api";
import { connectWS, subscribeWS } from "../../../../lib/ws"; // Import WS
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card } from "../../../../components/Ui/Card";
import { Button } from "../../../../components/Ui/Button";
import { Select } from "../../../../components/Ui/Select";
import { ConfirmDialog } from "../../../../components/Ui/ConfirmDialog";
import { useUserStore } from "../../../../store/userStore";
import { useToast } from "../../../../store/ToastContext";
import {
  UserPlus,
  Shield,
  Code,
  Eye,
  Mail,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";

type Member = {
  userId: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
  status?: "active" | "pending"; // Added status
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    githubId?: number;
  } | null;
};

type OrgInfo = {
  orgName: string;
  orgSlug: string;
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case "ADMIN":
      return <Shield className="h-4 w-4 text-brand" />;
    case "MEMBER":
      return <Code className="h-4 w-4 text-text-secondary" />;
    case "VIEWER":
      return <Eye className="h-4 w-4 text-text-secondary" />;
    default:
      return null;
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "MEMBER":
      return "Member";
    case "VIEWER":
      return "Viewer";
    default:
      return role;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
    case "MEMBER":
      return "bg-surface text-text-secondary border-border";
    case "VIEWER":
      return "bg-surface/50 text-text-secondary border-border";
    default:
      return "bg-surface text-text-secondary border-border";
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "?";
};

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orgId } = use(params);
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const { showToast } = useToast();

  const user = useUserStore((state) => state.user);

  const currentOrg = user?.orgIds?.find((o) => String(o.id) === String(orgId));
  const userRole = currentOrg?.role || "VIEWER";
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    if (orgId) {
      fetchMembers();
      connectWS();

      const unsubscribe = subscribeWS((event: any) => {
        console.log("WS Event received:", event); // Log the event for debugging
        if (event.type === "org:joined") {
          // Robust ID comparison (handle string vs objectid)
          const isSameOrg = String(event.org?._id) === String(orgId);

          // 1. Force Refresh (Nuclear Option as requested)
          // "pura website ka page refresh ho"
          window.location.reload();
        }
      });
      return () => unsubscribe();
    }
  }, [orgId, showToast]);

  const fetchMembers = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await api.get(`/orgs/${orgId}/members`);
      const data = res.data?.data;
      setMembers(data?.members || []);
      setOrgInfo({
        orgName: data?.orgName || "Organization",
        orgSlug: data?.orgSlug || "org",
      });
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !orgId) return;
    try {
      setInviting(true);

      await api.post(`/orgs/${orgId}/invite`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setInviteRole("MEMBER");
      showToast("Invitation sent successfully!", "success");
      setInviteEmail("");
      await fetchMembers();
      setShowInviteForm(false);
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || "Failed to invite user", "error");
    } finally {
      setInviting(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove || !orgId) return;
    try {
      setIsRemoving(true);
      await api.delete(`/orgs/${orgId}/members/${memberToRemove}`);
      setMembers(members.filter(m => m.userId !== memberToRemove));
      showToast("Member removed successfully", "success");
      setMemberToRemove(null);
    } catch (err: any) {
      console.error("Remove failed", err);
      showToast(err.response?.data?.error || "Failed to remove member", "error");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/orgs/${orgId}/members/${userId}`, { role: newRole });
      setMembers(members.map(m => m.userId === userId ? { ...m, role: newRole as any } : m));
      showToast("Role updated", "success");
    } catch (err) {
      console.error("Update role failed", err);
      showToast("Failed to update role", "error");
    }
  };

  const filteredMembers = members.filter((member) => {
    // Hide pending members as per user request
    if (member.status === 'pending') return false;

    if (!searchTerm.trim()) return true;
    const keyword = searchTerm.toLowerCase();
    return (member.user?.name?.toLowerCase() || "").includes(keyword) ||
      (member.user?.email?.toLowerCase() || "").includes(keyword);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-text-primary">Team Members</h1>
            <p className="mt-1 text-sm text-text-secondary">{orgInfo?.orgName}</p>
          </div>
          {isAdmin && (
            <Button className="border border-indigo-200 dark:border-indigo-800 cursor-pointer" onClick={() => setShowInviteForm(!showInviteForm)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          )}
        </header>

        {showInviteForm && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Invite New Member</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                className="flex-1 border border-border bg-background text-text-primary rounded-xl px-4 py-2 focus:border-brand focus:outline-none"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <div className="w-full sm:w-48">
                <Select
                  options={[
                    { label: "Member", value: "MEMBER" },
                    { label: "Admin", value: "ADMIN" },
                    { label: "Viewer", value: "VIEWER" },
                  ]}
                  value={inviteRole}
                  onChange={(val) => setInviteRole(val as any)}
                />
              </div>
              <Button onClick={handleInvite} disabled={inviting} className="border border-indigo-200 dark:border-indigo-800">
                {inviting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
            {/* Errors/Success now handled by Toast */}
          </Card>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl bg-background text-text-primary placeholder:text-text-secondary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.userId} className="p-4 group">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                  {member.user?.avatarUrl ? (
                    <Image src={member.user.avatarUrl} alt="" width={48} height={48} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold">
                      {getInitials(member.user?.name || "?")}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {member.user?.name || "Unknown User"}
                    </p>
                    {member.status === 'pending' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary truncate">
                    {member.user?.email}
                  </p>
                  <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    {getRoleLabel(member.role)}
                  </div>
                </div>
                {isAdmin && member.userId !== user?._id && (
                  <button onClick={() => setMemberToRemove(member.userId)} className="text-text-secondary hover:text-red-500 cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Remove Member"
        description="Are you sure you want to remove this member from the organization? They will lose access to all repositories and teams."
        confirmText="Remove Member"
        isLoading={isRemoving}
      />
    </DashboardLayout >
  );
}
