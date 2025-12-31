"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../lib/api";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card } from "../../../../components/Ui/Card";
import { Button } from "../../../../components/Ui/Button";
import { Select } from "../../../../components/Ui/Select";
import { useUserStore } from "../../../../store/userStore";
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

type TeamMember = {
  userId: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
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

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const user = useUserStore((state) => state.user);

  const currentOrg = user?.orgIds?.find((o) => String(o.id) === String(orgId));
  const userRole = currentOrg?.role || "VIEWER";
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    if (orgId) {
      fetchMembers();
    }
  }, [orgId]);

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
      setInviteError(null);
      await api.post(`/orgs/${orgId}/invite`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteSuccess(true);
      setInviteEmail("");
      setInviteRole("MEMBER");
      await fetchMembers();
      setTimeout(() => {
        setInviteSuccess(false);
        setShowInviteForm(false);
      }, 3000);
    } catch (err: any) {
      setInviteError(err.response?.data?.error?.message || "Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/orgs/${orgId}/members/${userId}`);
      setMembers(members.filter(m => m.userId !== userId));
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/orgs/${orgId}/members/${userId}`, { role: newRole });
      setMembers(members.map(m => m.userId === userId ? { ...m, role: newRole as any } : m));
    } catch (err) {
      console.error("Update role failed", err);
    }
  };

  const filteredMembers = members.filter((member) => {
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
            {inviteError && <p className="text-red-500 mt-2 text-sm">{inviteError}</p>}
            {inviteSuccess && <p className="text-green-500 mt-2 text-sm">Invite sent!</p>}
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
                  <p className="font-bold truncate text-text-primary">{member.user?.name}</p>
                  <p className="text-xs text-text-secondary truncate">{member.user?.email}</p>
                  <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    {getRoleLabel(member.role)}
                  </div>
                </div>
                {isAdmin && member.userId !== user?._id && (
                  <button onClick={() => handleRemoveMember(member.userId)} className="text-text-secondary hover:text-red-500 cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
