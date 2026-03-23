"use client";

import Image from "next/image";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { Card, CardBody, CardHeader, CardTitle } from "../../components/Ui/Card";
import { Mail, Shield, User, Code, Eye, Globe, Sparkles } from "lucide-react";

export default function MePage() {
  const { user, loading } = useUserStore();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { fetchUser } = useUserStore.getState();
    fetchUser().catch((err) => {
      console.error("Failed to fetch user:", err);
    });
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4 text-brand" />;
      case "MEMBER":
        return <Code className="h-4 w-4 text-text-secondary" />;
      case "VIEWER":
        return <Eye className="h-4 w-4 text-text-secondary" />;
      default:
        return <Globe className="h-4 w-4 text-text-secondary" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "MEMBER":
        return "Member";
      case "VIEWER":
        return "Viewer";
      default:
        return role;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 relative z-10 w-full max-w-7xl mx-auto">
        {/* Background Glows */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand/10 to-transparent -z-10 rounded-3xl blur-3xl pointer-events-none" />

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6 relative z-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Account Settings</h1>
            <p className="text-base text-text-secondary font-medium">Manage your profile and organization access</p>
          </div>
          <button
            onClick={() => useUserStore.getState().logout()}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 px-6 py-2.5 text-sm font-semibold text-rose-400 border border-rose-500/20 transition-all hover:bg-rose-500/20 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] active:scale-95 cursor-pointer"
          >
            Log Out
          </button>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-48 bg-surface/40 backdrop-blur-xl border-dashed border-white/10 rounded-2xl" />
            ))}
          </div>
        ) : !user ? (
          <Card className="border-rose-500/20 bg-rose-500/5 backdrop-blur-xl rounded-2xl shadow-2xl">
            <CardBody className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                <User className="h-8 w-8 text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Not Authenticated</h2>
              <p className="text-sm text-text-secondary mt-2 max-w-sm">Please log in to view your account details and manage your settings.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="overflow-hidden border border-white/10 bg-surface/40 backdrop-blur-xl shadow-2xl rounded-2xl group">
                <div className="h-32 bg-gradient-to-br from-brand via-indigo-500 to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full transform translate-x-10 -translate-y-10" />
                </div>
                <CardBody className="relative pt-0 px-6 pb-6">
                  <div className="flex flex-col items-center -translate-y-12">
                    <div className="relative inline-block group-hover:scale-105 transition-transform duration-500">
                      <Image
                        src={user.avatarUrl || "https://github.com/identicons/null.png"}
                        alt={user.name || "User"}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-2xl border-4 border-background bg-background shadow-xl object-cover"
                      />
                      <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-emerald-500 border-4 border-background shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    </div>
                    <div className="mt-4 text-center">
                      <h2 className="text-2xl font-bold text-white tracking-tight">{user.name || "Anonymous User"}</h2>
                      <p className="text-sm text-brand font-semibold mt-1">@{user.login || "user"}</p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-white/10 pt-6">
                    <div className="flex items-center gap-4 text-sm group/item">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-brand/20 group-hover/item:text-brand transition-colors text-text-secondary border border-white/5 group-hover/item:border-brand/30 shadow-sm">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-0.5">Email Address</p>
                        <p className="text-white truncate font-medium">{user.email || "No email provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm group/item">
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/item:bg-brand/20 group-hover/item:text-brand transition-colors text-text-secondary border border-white/5 group-hover/item:border-brand/30 shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-0.5">Account ID</p>
                        <p className="text-white truncate font-mono text-xs bg-white/5 px-2 py-1 rounded-md w-fit border border-white/5">{user.id || user._id || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Organizations Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-white/10 bg-surface/40 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between py-5 px-6 border-b border-white/10 bg-white/[0.02]">
                  <CardTitle className="text-xl font-bold text-white tracking-tight">Your Organizations</CardTitle>
                  <span className="rounded-full bg-brand/20 border border-brand/30 px-3 py-1 text-xs font-bold text-brand shadow-[0_0_15px_rgba(94,106,210,0.3)]">
                    {user.orgIds?.length || 0} Total
                  </span>
                </CardHeader>
                <CardBody className="p-0">
                  {user.orgIds && user.orgIds.length > 0 ? (
                    <div className="divide-y divide-white/10">
                      {user.orgIds.map((org: any) => (
                        <div key={org.id || org._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/5 transition-all duration-300 group cursor-pointer">
                          <div className="flex items-center gap-5 mb-4 sm:mb-0">
                            <div className="relative">
                                <div className="absolute inset-0 bg-brand blur-md opacity-0 group-hover:opacity-40 transition-opacity rounded-xl" />
                                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-indigo-600 text-xl font-extrabold text-white shadow-lg border border-white/20 group-hover:scale-105 transition-transform">
                                {org.name?.[0]?.toUpperCase() || "O"}
                                </div>
                            </div>
                            <div>
                              <p className="font-bold text-lg text-white group-hover:text-brand transition-colors">{org.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md border border-white/10">ID: {org.id || org._id}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 w-full sm:w-auto">
                            <div className="flex items-center gap-2 rounded-lg bg-surface/80 border border-white/5 px-3 py-1.5 shadow-inner">
                              {getRoleIcon(org.role)}
                              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                                {getRoleLabel(org.role)}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 hidden sm:block">View Details →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-text-secondary">
                      <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                        <Globe className="h-8 w-8 text-text-secondary opacity-50" />
                      </div>
                      <p className="text-lg font-medium text-white mb-2">No Organizations Found</p>
                      <p className="text-sm max-w-sm">You are not linked to any organizations currently.</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-brand/10 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative backdrop-blur-xl group">
                <div className="py-8 px-8 sm:px-10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-extrabold mb-2 text-white flex items-center gap-2 justify-center sm:justify-start">
                        <Sparkles className="h-6 w-6 text-brand animate-pulse" /> Need a new organization?
                    </h3>
                    <p className="text-sm max-w-md font-medium text-gray-400 leading-relaxed">
                        Create a separate organization to isolate projects, billing, and team members. Perfect for agencies and multi-project accounts.
                    </p>
                  </div>
                  <a
                    href="/organization"
                    className="shrink-0 inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-bold transition-all shadow-lg hover:shadow-brand/20 active:scale-95 border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 cursor-pointer backdrop-blur-md"
                  >
                    Manage Organizations
                  </a>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brand/30 blur-[80px] opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-purple-500/20 blur-[80px] opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
