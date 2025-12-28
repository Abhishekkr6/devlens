"use client";

import Image from "next/image";
import DashboardLayout from "../../components/Layout/DashboardLayout";
import { useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { Card, CardBody, CardHeader, CardTitle } from "../../components/Ui/Card";
import { Mail, Shield, User, Code, Eye, Globe } from "lucide-react";

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
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-semibold text-text-primary">Account Settings</h1>
            <p className="text-base text-text-secondary">Manage your profile and organization access</p>
          </div>
          <button
            onClick={() => useUserStore.getState().logout()}
            className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 px-6 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/40 hover:shadow-sm active:scale-95"
          >
            Log Out
          </button>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-48 bg-surface border-dashed border-border" />
            ))}
          </div>
        ) : !user ? (
          <Card className="border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10">
            <CardBody className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">Not Authenticated</h2>
              <p className="text-sm text-text-secondary mt-1">Please log in to view your account details.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="overflow-hidden border border-border bg-background">
                <div className="h-24 bg-linear-to-br from-brand to-brand/60" />
                <CardBody className="relative pt-0">
                  <div className="flex flex-col items-center -translate-y-12">
                    <div className="relative inline-block">
                      <Image
                        src={user.avatarUrl || "https://github.com/identicons/null.png"}
                        alt={user.name || "User"}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-2xl border-4 border-background bg-background shadow-md object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>
                    <div className="mt-4 text-center">
                      <h2 className="text-xl font-bold text-text-primary">{user.name || "Anonymous User"}</h2>
                      <p className="text-sm text-text-secondary font-medium">@{user.login || "user"}</p>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-border pt-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center">
                        <Mail className="h-4 w-4 text-text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Email Address</p>
                        <p className="text-text-primary truncate">{user.email || "No email provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center">
                        <User className="h-4 w-4 text-text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">Account ID</p>
                        <p className="text-text-primary truncate font-mono text-xs">{user.id || user._id || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Organizations Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-border bg-background">
                <CardHeader className="flex items-center justify-between py-4">
                  <CardTitle className="text-lg text-text-primary">Your Organizations</CardTitle>
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    {user.orgIds?.length || 0} Total
                  </span>
                </CardHeader>
                <CardBody className="p-0">
                  {user.orgIds && user.orgIds.length > 0 ? (
                    <div className="divide-y divide-border">
                      {user.orgIds.map((org: any) => (
                        <div key={org.id || org._id} className="flex items-center justify-between p-4 hover:bg-surface transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-sm font-bold text-black/10 shadow-sm">
                              {org.name?.[0]?.toUpperCase() || "O"}
                            </div>
                            <div>
                              <p className="font-semibold text-text-primary">{org.name}</p>
                              <p className="text-xs text-text-secondary font-medium uppercase tracking-tight">ID: {org.id || org._id}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1">
                              {getRoleIcon(org.role)}
                              <span className="text-xs font-bold text-text-secondary">
                                {getRoleLabel(org.role)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-text-secondary">
                      < Globe className="h-10 w-10 text-text-secondary mb-2" />
                      <p className="text-sm">No organizations linked to this account.</p>
                    </div>
                  )}
                </CardBody>
              </Card>

              <div className="bg-white/10 border border-border rounded-xl shadow-sm overflow-hidden relative shadow-brand/20">
                <div className="py-8 px-8 relative z-10">
                  <h3 className="text-xl font-bold mb-2 text-white">Need a new organization?</h3>
                  <p className="text-sm mb-6 max-w-md font-medium text-gray-300">
                    You can create a new organization to isolate your projects and team members, or ask an administrator to invite you to an existing one.
                  </p>
                  <a
                    href="/organization"
                    className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold transition-all hover:shadow-xl active:scale-95 border border-white bg-transparent text-white hover:bg-white/10"
                  >
                    Manage Organizations
                  </a>
                </div>
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 h-32 w-32 rounded-full bg-white/5 blur-2xl opacity-30" />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
