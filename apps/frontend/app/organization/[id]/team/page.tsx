"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../lib/api";
import DashboardLayout from "../../../../components/Layout/DashboardLayout";
import { Card } from "../../../../components/Ui/Card";
import { Button } from "../../../../components/Ui/Button";
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
      return <Shield className="h-4 w-4 text-indigo-600" />;
    case "MEMBER":
      return <Code className="h-4 w-4 text-slate-600" />;
    case "VIEWER":
      return <Eye className="h-4 w-4 text-slate-400" />;
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
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "MEMBER":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "VIEWER":
      return "bg-slate-50 text-slate-500 border-slate-100";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
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

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params?.id as string;

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

  useEffect(() => {
    if (orgId) {
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        orgSlug: data?.orgSlug || "",
      });
    } catch (err: unknown) {
      console.error("Failed to fetch team members:", err);
      setMembers([]);
      const axiosError = err as { response?: { status?: number } };
      if (axiosError.response?.status === 403 || axiosError.response?.status === 404) {
        router.push(`/organization/${orgId}/dashboard`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!orgId || !inviteEmail.trim()) {
      setInviteError("Email is required");
      return;
    }

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
      
      // Refresh members list
      await fetchMembers();

      // Reset success message after 3 seconds
      setTimeout(() => {
        setInviteSuccess(false);
        setShowInviteForm(false);
      }, 3000);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      const errorMsg =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        "Failed to invite user. Please try again.";
      setInviteError(errorMsg);
    } finally {
      setInviting(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    if (!searchTerm.trim()) return true;
    const keyword = searchTerm.toLowerCase();
    const name = member.user?.name?.toLowerCase() || "";
    const email = member.user?.email?.toLowerCase() || "";
    const role = getRoleLabel(member.role).toLowerCase();
    return name.includes(keyword) || email.includes(keyword) || role.includes(keyword);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Team Members</h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              {orgInfo?.orgName ? `Manage team for ${orgInfo.orgName}` : "Manage your organization team"}
            </p>
          </div>
          <Button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="mt-4 sm:mt-0 w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </header>

        {/* Invite Form */}
        {showInviteForm && (
          <Card className="rounded-2xl border-0 bg-white p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Invite New Member</h2>
              <button
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteEmail("");
                  setInviteRole("MEMBER");
                  setInviteError(null);
                  setInviteSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close invite form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {inviteSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>User invited successfully!</span>
              </div>
            )}

            {inviteError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4" />
                <span>{inviteError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="invite-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="invite-role" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "MEMBER" | "VIEWER")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="VIEWER">Viewer - Read-only access</option>
                  <option value="MEMBER">Member - Can contribute</option>
                  <option value="ADMIN">Admin - Full access</option>
                </select>
              </div>

              <Button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="w-full sm:w-auto"
              >
                {inviting ? "Inviting..." : "Send Invitation"}
              </Button>
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search members by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Members List */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex animate-pulse items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <Card className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-none">
            {searchTerm ? (
              <>
                <p className="text-sm font-medium text-slate-600">No members found</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try adjusting your search terms
                </p>
              </>
            ) : (
              <>
                <Users className="mx-auto h-12 w-12 text-slate-400" />
                <p className="mt-4 text-sm font-medium text-slate-600">No team members yet</p>
                <p className="mt-1 text-xs text-slate-500">
                  Invite your first team member to get started
                </p>
              </>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <MemberCard key={member.userId} member={member} />
            ))}
          </div>
        )}

        {/* Member Count */}
        {!loading && members.length > 0 && (
          <div className="text-center text-sm text-slate-500">
            Showing {filteredMembers.length} of {members.length} member{members.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const user = member.user;

  return (
    <Card className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-indigo-400">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name || "User"}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
              {user?.name ? getInitials(user.name) : "?"}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.name || "Unknown User"}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {user?.email || "No email"}
              </p>
            </div>
          </div>

          {/* Role Badge */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
              {getRoleIcon(member.role)}
              {getRoleLabel(member.role)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
