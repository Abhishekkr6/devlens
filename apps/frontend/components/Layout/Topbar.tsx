"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  ChevronDown,
  FolderGit2,
  GitPullRequest,
  LayoutDashboard,
  Menu,
  Search,
  Users,
  X,
  Settings as SettingsIcon,
  UserPlus,
  Shield,
  Eye,
  Code,
} from "lucide-react";
import { FloatingDock } from "../Ui/floating-dock";
import { useUserStore } from "../../store/userStore";
import { getBackendBase } from "../../lib/api";
import { api } from "../../lib/api";

type User = {
  name: string;
  avatarUrl: string;
  email?: string;
  orgIds?: { id: string; name: string }[];
};

const navLinks = [
  { name: "Overview", href: (id: string) => `/organization/${id}`, icon: LayoutDashboard },
  { name: "Activity", href: (id: string) => `/organization/${id}/activity`, icon: Activity },
  { name: "Pull Requests", href: (id: string) => `/organization/${id}/prs`, icon: GitPullRequest },
  { name: "Alerts", href: (id: string) => `/organization/${id}/alerts`, icon: Bell },
  { name: "Developers", href: (id: string) => `/organization/${id}/developers`, icon: Users },
  { name: "Repositories", href: (id: string) => `/organization/${id}/repos`, icon: FolderGit2 },
  { name: "Settings", href: (id: string) => `/organization/${id}/settings`, icon: SettingsIcon },
];

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

export default function Topbar() {
  const { user, loading, activeOrgId } = useUserStore() as {
    user: User | null;
    loading: boolean;
    activeOrgId: string | null;
  };
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const teamDropdownRef = useRef<HTMLDivElement>(null);

  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);
  const closeMobileNav = () => setMobileNavOpen(false);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    // Prevent background scroll while the mobile navigation drawer is visible.
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileNav();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileNavOpen]);

  // Bootstrap user on mount (client-only). Guard to avoid SSR and loops.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { fetchUser } = useUserStore.getState();
    fetchUser();
  }, []);

  // Fetch team members when dropdown opens and orgId is available
  useEffect(() => {
    if (teamDropdownOpen && activeOrgId) {
      fetchTeamMembers();
    }
  }, [teamDropdownOpen, activeOrgId]);

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const { setActiveOrganization } = useUserStore();

  const handleOrgSwitch = (orgId: string) => {
    setActiveOrganization(orgId);
    setOrgDropdownOpen(false);
    router.push(`/organization/${orgId}/repos`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        teamDropdownRef.current &&
        !teamDropdownRef.current.contains(event.target as Node)
      ) {
        setTeamDropdownOpen(false);
      }
      if (
        orgDropdownRef.current &&
        !orgDropdownRef.current.contains(event.target as Node)
      ) {
        setOrgDropdownOpen(false);
      }
    };

    if (teamDropdownOpen || orgDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [teamDropdownOpen, orgDropdownOpen]);

  const fetchTeamMembers = async () => {
    if (!activeOrgId) return;

    try {
      setLoadingMembers(true);
      const res = await api.get(`/orgs/${activeOrgId}/members`);
      const members = res.data?.data?.members || [];
      setTeamMembers(members);
    } catch (err) {
      console.error("Failed to fetch team members:", err);
      setTeamMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const currentOrg = user?.orgIds?.find((o) => o.id === activeOrgId);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-3 w-3 text-brand" />;
      case "MEMBER":
        return <Code className="h-3 w-3 text-text-secondary" />;
      case "VIEWER":
        return <Eye className="h-3 w-3 text-text-secondary" />;
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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const renderNavLinks = (className?: string) =>
    navLinks.map(({ name, href, icon: Icon }) => {
      const resolvedHref = activeOrgId ? href(activeOrgId) : "/organization";
      const active = isActive(resolvedHref);
      return (
        <Link
          key={resolvedHref}
          href={resolvedHref}
          onClick={closeMobileNav}
          className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 transition-colors ${active
            ? "bg-indigo-100 dark:bg-brand/20 text-indigo-700 dark:text-brand"
            : "text-text-secondary hover:bg-surface hover:text-indigo-600 dark:hover:text-brand"
            } ${className ?? ""}`.trim()}
        >
          <Icon className="h-4 w-4" />
          {name}
        </Link>
      );
    });

  const dockItems = navLinks.map(({ name, href, icon: Icon }) => {
    const resolvedHref = activeOrgId ? href(activeOrgId) : "/organization";
    return {
      title: name,
      href: resolvedHref,
      icon: <Icon className="h-4 w-4" />,
      isActive: isActive(resolvedHref),
    };
  });

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-50">
        <div className="flex w-full flex-nowrap items-center gap-2 md:gap-3 py-3">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1 transition-colors hover:bg-surface/80"
            aria-label="TeamPulse home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-sm font-semibold shadow-sm">
              <svg className="w-5 h-5 text-white dark:text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
            <div className="min-w-0 text-left hidden lg:block">
              <p className="truncate text-sm font-semibold text-text-primary">TeamPulse</p>
              <p className="hidden text-xs text-text-secondary sm:block">Developer Activity</p>
            </div>
          </Link>

          {/* Org Switcher */}
          {user && user.orgIds && user.orgIds.length > 0 && (
            <div className="relative ml-2" ref={orgDropdownRef}>
              <button
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-sm font-medium text-text-secondary transition hover:border-brand hover:text-brand shadow-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 dark:bg-brand/20 text-xs font-bold text-indigo-700 dark:text-brand">
                  {currentOrg?.name?.[0]?.toUpperCase() || "O"}
                </div>
                <span className="max-w-[100px] truncate sm:max-w-[140px]">
                  {currentOrg?.name || "Select Organization"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-text-secondary transition-transform ${orgDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {orgDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 origin-top-left rounded-xl border border-border bg-background backdrop-blur-3xl p-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[100]">
                  <div className="mb-2 border-b border-border px-2 pb-2">
                    <p className="text-xs font-medium text-text-secondary">Switch Organization</p>
                  </div>

                  <div className="space-y-1">
                    {user.orgIds.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => handleOrgSwitch(org.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors ${activeOrgId === org.id
                          ? "bg-indigo-50 dark:bg-brand/20 text-indigo-700 dark:text-brand"
                          : "text-text-secondary hover:bg-surface"
                          }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${activeOrgId === org.id ? "bg-indigo-200 dark:bg-brand/40 text-brand" : "bg-surface text-text-secondary"
                          }`}>
                          {org.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="font-medium">{org.name}</p>
                        </div>
                        {activeOrgId === org.id && (
                          <div className="h-2 w-2 rounded-full bg-brand" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 border-t border-border pt-2">
                    <Link
                      href="/organization"
                      onClick={() => setOrgDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-text-secondary hover:bg-surface hover:text-brand"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Manage Organizations
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <div className="relative hidden md:block md:w-48 lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="search"
                placeholder="Search..."
                className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-4 text-sm text-text-primary transition-colors placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <button
              type="button"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-text-secondary transition-colors hover:border-brand hover:text-brand md:flex"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </button>

            <div className="relative hidden md:block" ref={teamDropdownRef}>
              <button
                type="button"
                onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand"
              >
                <Users className="h-4 w-4" />
                Team
                <ChevronDown className={`h-4 w-4 transition-transform ${teamDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {teamDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-background backdrop-blur-3xl shadow-lg z-[100]">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-text-primary">Team Members</h3>
                      {activeOrgId && (
                        <Link
                          href={`/organization/${activeOrgId}/team`}
                          onClick={() => setTeamDropdownOpen(false)}
                          className="text-xs text-brand hover:text-brand/80 font-medium"
                        >
                          Manage
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loadingMembers ? (
                      <div className="p-4 text-center text-sm text-text-secondary">
                        Loading members...
                      </div>
                    ) : teamMembers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-text-secondary">
                        {activeOrgId ? "No members found" : "Select an organization"}
                      </div>
                    ) : (
                      <div className="p-2">
                        {teamMembers.map((member) => (
                          <div
                            key={member.userId}
                            className="flex items-center gap-3 rounded-lg p-2 hover:bg-surface transition-colors"
                          >
                            {member.user?.avatarUrl ? (
                              <Image
                                src={member.user.avatarUrl}
                                alt={member.user.name}
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center text-xs font-medium text-text-secondary">
                                {member.user?.name?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">
                                {member.user?.name || "Unknown User"}
                              </p>
                              <p className="text-xs text-text-secondary truncate">
                                {member.user?.email || "No email"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {getRoleIcon(member.role)}
                              <span className="text-xs text-text-secondary">
                                {getRoleLabel(member.role)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {activeOrgId && (
                    <div className="p-3 border-t border-border">
                      <Link
                        href={`/organization/${activeOrgId}/team`}
                        onClick={() => setTeamDropdownOpen(false)}
                        className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium text-brand hover:bg-brand/10 transition-colors"
                      >
                        <UserPlus className="h-4 w-4" />
                        Invite Member
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center">
                <Link
                  href="/me"
                  className="flex items-center gap-3 rounded-l-full border border-r-0 border-border bg-background px-3 py-1.5 text-sm shadow-sm transition hover:border-brand hover:bg-brand/10"
                >
                  <Image
                    src={user.avatarUrl}
                    alt={`${user.name}'s avatar`}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                    {user.email && <p className="text-xs text-text-secondary">{user.email}</p>}
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => useUserStore.getState().logout()}
                  className="flex items-center gap-2 rounded-r-full border border-border bg-background px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 hover:border-rose-200 transform border-l-0"
                >
                  <X className="h-3 w-3" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-full border border-border bg-background px-3 py-1.5 text-sm shadow-sm">
                <div className="h-8 w-8 rounded-full bg-surface animate-pulse" />
                <div className="hidden sm:block">
                  <div className="h-3 w-24 rounded bg-surface animate-pulse mb-1" />
                  <div className="h-2 w-32 rounded bg-surface animate-pulse" />
                </div>
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-text-secondary transition-colors hover:border-brand hover:text-brand"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </button>

            {user ? (
              <Link href="/me" className="inline-flex rounded-full">
                <Image
                  src={user.avatarUrl}
                  alt={`${user.name}'s avatar`}
                  width={32}
                  height={32}
                  className="h-9 w-9 rounded-full border border-border"
                />
              </Link>
            ) : (
              <div className="h-9 w-9 rounded-full bg-surface animate-pulse" />
            )}

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-text-secondary transition-colors hover:border-brand hover:text-brand"
              onClick={toggleMobileNav}
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-center py-2">
        <FloatingDock
          items={dockItems}
          desktopClassName="bg-slate-900/95 backdrop-blur-3xl px-4 py-2 shadow-xl rounded-2xl border border-gray-200 dark:border-slate-700"
          mobileClassName="w-fit bg-slate-900/95 backdrop-blur-3xl rounded-2xl border border-gray-400 dark:border-slate-700"
        />
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeMobileNav}
          />
          <aside className="absolute inset-y-0 right-0 flex w-80 max-w-[80vw] translate-x-0 bg-slate-900/95 backdrop-blur-3xl shadow-2xl">
            <div className="flex h-full w-full flex-col gap-6 p-6" id="mobile-navigation">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-sm font-semibold shadow-sm">
                    <svg className="w-5 h-5 text-white dark:text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-text-primary">TeamPulse</p>
                    <p className="text-xs text-text-secondary">Developer Activity</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-brand hover:text-brand"
                  onClick={closeMobileNav}
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="h-10 w-full rounded-full border border-border bg-surface pl-9 pr-3 text-sm text-text-secondary transition-colors placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-brand focus:bg-background focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <nav className="flex flex-col gap-2 text-sm font-medium text-text-secondary">
                {renderNavLinks("w-full")}

                {activeOrgId && (
                  <Link
                    href={`/organization/${activeOrgId}/team`}
                    onClick={closeMobileNav}
                    className="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 transition-colors text-text-secondary hover:bg-surface hover:text-brand w-full"
                  >
                    <Users className="h-4 w-4" />
                    Team Management
                  </Link>
                )}
              </nav>

              {user ? (
                <div className="mt-auto flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                  <Image
                    src={user.avatarUrl}
                    alt={`${user.name}'s avatar`}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border border-border"
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                    {user.email && <p className="text-xs text-text-secondary">{user.email}</p>}
                  </div>
                </div>
              ) : (
                <div className="mt-auto flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                  <div className="h-10 w-10 rounded-full bg-border/20 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-3 w-24 rounded bg-border/20 animate-pulse mb-1" />
                    <div className="h-2 w-32 rounded bg-surface-200 animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
