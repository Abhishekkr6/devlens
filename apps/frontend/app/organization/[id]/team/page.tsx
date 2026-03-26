"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "../../../../lib/api";
import { connectWS, subscribeWS } from "../../../../lib/ws"; // Import WS
import DashboardLayout from "@/components/Layout/DashboardLayout";
import { Card } from "../../../../components/Ui/Card";
import { Button } from "../../../../components/Ui/Button";
import { Select } from "../../../../components/Ui/Select";
import { ConfirmDialog } from "../../../../components/Ui/ConfirmDialog";
import { useUserStore, Org } from "../../../../store/userStore";
import { toast } from "sonner";
import {
  UserPlus,
  Shield,
  Code,
  Eye,
  Mail,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
      return "bg-brand/10 text-brand border-brand/20 shadow-sm";
    case "MEMBER":
      return "bg-surface/80 text-text-secondary border-white/10";
    case "VIEWER":
      return "bg-surface/40 text-text-secondary border-white/5";
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
  const { id } = use(params);
  const orgId = id;
  const router = useRouter();

  const user = useUserStore((state) => state.user);

  const [members, setMembers] = useState<Member[]>([]);
  const [orgInfo, setOrgInfo] = useState<OrgInfo | null>(null);
    const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "VIEWER">("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const currentOrg = user?.orgIds?.find((o: Org) => String(o._id) === String(orgId));
  const userRole = currentOrg?.role || "VIEWER";
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    if (orgId) {
      fetchMembers();
      connectWS();

      const unsubscribe = subscribeWS((e: unknown) => {
        const event = e as { type: string; org?: { _id: string }; member?: Member };

        if (event.type === "org:joined") {
          // Robust ID comparison (handle string vs objectid)
          const isSameOrg = String(event.org?._id) === String(orgId);
          if (isSameOrg) {
            // 1. Optimistic Update (Immediate)
            if (event.member) {
              setMembers((prev) => {
                const newMemberId = String(event.member!.userId);
                // Prevent duplicates
                if (prev.some(m => String(m.userId) === newMemberId)) return prev;
                return [...prev, event.member!];
              });
              toast.success(`${event.member.user?.name || "A user"} joined the team`);
            }

            // 2. Fetch Latest (Guarantee Consistency without Reload)
            fetchMembers();
          }
        }
      });
      return () => unsubscribe();
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

      await api.post(`/orgs/${orgId}/invite`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setInviteRole("MEMBER");
      toast.success("Invitation sent successfully!");
      setInviteEmail("");
      await fetchMembers();
      setShowInviteForm(false);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      const errorMsg = e.response?.data?.error?.message || "Failed to invite user";
      if (errorMsg.toLowerCase().includes("free plan") || errorMsg.toLowerCase().includes("upgrade")) {
        toast.error(errorMsg, {
          action: {
            label: "Upgrade to Pro",
            onClick: () => router.push("/pricing")
          },
          duration: 5000,
        });
      } else {
        toast.error(errorMsg);
      }
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
      toast.success("Member removed successfully");
      setMemberToRemove(null);
    } catch (err: unknown) {
      console.error("Remove failed", err);
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || "Failed to remove member");
    } finally {
      setIsRemoving(false);
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="space-y-6 sm:space-y-8"
      >
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <motion.div initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay:0.1}}>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">Team Members</h1>
            <p className="mt-2 text-sm sm:text-base text-text-secondary font-light">{orgInfo?.orgName}</p>
          </motion.div>
          {isAdmin && (
            <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.2}}>
            <Button 
                onClick={() => setShowInviteForm(!showInviteForm)}
                className={`rounded-2xl border ${showInviteForm ? "border-border bg-surface text-text-secondary" : "border-brand bg-brand text-white shadow-lg shadow-brand/25"} px-5 py-2.5 text-sm font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer`}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {showInviteForm ? "Cancel Invite" : "Invite Member"}
            </Button>
            </motion.div>
          )}
        </header>

        <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
          <Card className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-surface/80 backdrop-blur-2xl shadow-xl relative z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full pointer-events-none" />
            <h2 className="text-lg sm:text-xl font-bold mb-6 tracking-tight flex items-center gap-2"><Mail className="w-5 h-5 text-brand" /> Invite New Member</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                className="flex-1 border border-white/10 bg-background/50 backdrop-blur-md text-text-primary rounded-2xl px-5 py-3 text-sm focus:border-brand/50 focus:ring-4 focus:ring-brand/10 transition-all outline-none"
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
                  onChange={(val) => setInviteRole(val as "ADMIN" | "MEMBER" | "VIEWER")}
                  containerClassName="w-full"
                />
              </div>
              <Button onClick={handleInvite} disabled={inviting} className="rounded-2xl border border-brand bg-brand px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-50">
                {inviting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </Card>
          </motion.div>
        )}
        </AnimatePresence>

        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="relative group z-20"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary group-focus-within:text-brand transition-colors" />
          <input
            className="w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-2xl bg-surface/50 backdrop-blur-md text-text-primary text-sm placeholder:text-text-secondary focus:border-brand/50 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all shadow-sm"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredMembers.map((member, i) => (
            <motion.div key={member.userId} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{ duration: 0.5, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}>
            <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-5 sm:p-6 shadow-lg hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.15)] transition-all duration-300 relative group overflow-hidden h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="flex items-start gap-4 h-full relative z-10">
                <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl overflow-hidden bg-surface border border-white/10 shadow-sm flex items-center justify-center">
                  {member.user?.avatarUrl ? (
                    <Image src={member.user.avatarUrl} alt="" width={56} height={56} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-lg text-text-secondary">
                      {getInitials(member.user?.name || "?")}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-bold text-text-primary truncate tracking-tight">
                      {member.user?.name || "Unknown User"}
                    </p>
                    {member.status === 'pending' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm shrink-0">
                        Pending
                      </span>
                    )}
                    {isAdmin && member.userId !== user?._id && (
                      <button onClick={() => setMemberToRemove(member.userId)} className="text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 -mt-1 -mr-1">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5 font-medium">
                    {member.user?.email}
                  </p>
                  
                  <div className="mt-auto pt-4 flex items-center">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getRoleBadgeColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {getRoleLabel(member.role)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

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
