"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ChevronDown,
    GitCommit,
    GitPullRequest,
    MessageSquare,
    Search,
    TrendingUp,
} from "lucide-react";
import { Card } from "../../../../components/Ui/Card";
import { Select } from "../../../../components/Ui/Select";
import { api } from "../../../../lib/api";
import { useUserStore } from "../../../../store/userStore";

interface Developer {
    githubId: string;
    name: string;
    avatarUrl?: string | null;
    role?: string | null;
    weeklyActivity: number;
    commits: number;
    prs: number;
    reviews: number;
}

type ActivityLevel = "high" | "medium" | "low" | "inactive";

const ACTIVITY_FILTER_LABELS: Record<ActivityLevel, string> = {
    high: "High Activity",
    medium: "Moderate Activity",
    low: "Developing Activity",
    inactive: "Needs Attention",
};

const ROLE_LABELS: Record<string, string> = {
    admin: "Admin",
    lead: "Engineering Lead",
    dev: "Software Engineer",
    viewer: "Viewer",
};

const formatRole = (role?: string | null) => {
    if (!role) return "Software Engineer";
    const key = role.toLowerCase();
    if (ROLE_LABELS[key]) return ROLE_LABELS[key];
    return role
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getActivityLevel = (weeklyActivity: number): ActivityLevel => {
    if (weeklyActivity >= 80) return "high";
    if (weeklyActivity >= 50) return "medium";
    if (weeklyActivity >= 25) return "low";
    return "inactive";
};

const getActivityColor = (weeklyActivity: number) => {
    if (weeklyActivity >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (weeklyActivity >= 50) return "text-blue-600 dark:text-blue-400";
    if (weeklyActivity >= 25) return "text-amber-600 dark:text-amber-400";
    return "text-slate-500 dark:text-slate-400";
};

const getProgressColor = (weeklyActivity: number) => {
    if (weeklyActivity >= 80) return "bg-emerald-500";
    if (weeklyActivity >= 50) return "bg-blue-500";
    if (weeklyActivity >= 25) return "bg-amber-500";
    return "bg-slate-400";
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

export default function DevelopersClient({ orgId }: { orgId: string }) {
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activityFilter, setActivityFilter] = useState<string>("all");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    // Convert slug to orgId using userStore
    const { user } = useUserStore();

    useEffect(() => {
        if (!orgId) return;
        const fetchDevelopers = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/orgs/${orgId}/developers`);
                const payload: Developer[] = Array.isArray(response.data?.data) ? response.data.data : [];
                setDevelopers(payload);
            } catch (error) {
                console.warn("Failed to load developers", error);
                setDevelopers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDevelopers();
    }, [orgId]);

    const roleOptions = useMemo(() => {
        const uniqueRoles = new Set<string>();
        developers.forEach((dev) => {
            if (dev.role) {
                uniqueRoles.add(dev.role.toLowerCase());
            }
        });
        return Array.from(uniqueRoles).sort();
    }, [developers]);

    const filteredDevelopers = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return developers.filter((dev) => {
            const matchesSearch =
                keyword.length === 0 ||
                dev.name.toLowerCase().includes(keyword) ||
                dev.githubId.toLowerCase().includes(keyword);

            const level = getActivityLevel(dev.weeklyActivity);
            const matchesActivity = activityFilter === "all" || activityFilter === level;

            const devRoleValue = dev.role ? dev.role.toLowerCase() : "";
            const matchesRole = roleFilter === "all" || roleFilter === devRoleValue;

            return matchesSearch && matchesActivity && matchesRole;
        });
    }, [developers, searchTerm, activityFilter, roleFilter]);

    const emptyState = (
        <Card className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-text-secondary shadow-none">
            No developers found for this organization. Adjust your filters or try a different search.
        </Card>
    );

    return (
        <div className="space-y-8 relative z-10">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/10 to-transparent -z-10 rounded-[100%] blur-[120px] pointer-events-none" />

            <header className="flex flex-col gap-3 border-b border-white/10 pb-6">
                <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Developers</h1>
                <p className="text-base text-text-secondary font-medium">Team member activity and performance metrics for this organization</p>
            </header>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 rounded-2xl bg-surface/40 backdrop-blur-xl border border-white/10 shadow-lg">
                <div className="relative w-full lg:max-w-md xl:max-w-xl group">
                    <div className="absolute inset-0 bg-brand/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full pointer-events-none" />
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary group-focus-within:text-brand transition-colors" />
                    <input
                        aria-label="Search developers"
                        className="relative h-12 w-full rounded-xl border border-white/10 bg-black/40 pl-12 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all shadow-inner"
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search developers by name or ID..."
                        type="search"
                        value={searchTerm}
                    />
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Select
                        containerClassName="sm:w-48"
                        options={[
                            { label: "Activity Level", value: "all" },
                            ...(Object.keys(ACTIVITY_FILTER_LABELS) as ActivityLevel[]).map((key) => ({
                                label: ACTIVITY_FILTER_LABELS[key],
                                value: key,
                            })),
                        ]}
                        value={activityFilter}
                        onChange={(val) => setActivityFilter(val)}
                    />

                    <Select
                        containerClassName="sm:w-48"
                        options={[
                            { label: "Role", value: "all" },
                            ...roleOptions.map((role) => ({
                                label: formatRole(role),
                                value: role,
                            })),
                        ]}
                        value={roleFilter}
                        onChange={(val) => setRoleFilter(val)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card
                            key={index}
                            className="rounded-2xl border border-white/10 bg-surface/40 backdrop-blur-xl p-6 shadow-xl"
                        >
                            <div className="flex animate-pulse flex-col gap-5">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white/5 shadow-inner" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 w-2/3 rounded-lg bg-white/10" />
                                        <div className="h-3 w-1/3 rounded-lg bg-white/5" />
                                    </div>
                                </div>
                                <div className="space-y-3 mt-2">
                                    <div className="h-2 w-full rounded-full bg-white/5" />
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="h-16 rounded-xl bg-white/5" />
                                        <div className="h-16 rounded-xl bg-white/5" />
                                        <div className="h-16 rounded-xl bg-white/5" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : filteredDevelopers.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                        <Search className="w-8 h-8 text-text-secondary opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No developers found</h3>
                    <p className="text-text-secondary max-w-sm">
                        Adjust your filters or try a different search term to find team members.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredDevelopers.map((developer) => (
                        <DeveloperCard key={developer.githubId} developer={developer} orgId={orgId} />
                    ))}
                </div>
            )}
        </div>
    );
}

function DeveloperCard({ developer, orgId }: { developer: Developer; orgId?: string }) {
    const activityColor = getActivityColor(developer.weeklyActivity);
    const progressColor = getProgressColor(developer.weeklyActivity);
    const levelLabel = ACTIVITY_FILTER_LABELS[getActivityLevel(developer.weeklyActivity)];

    const cardContent = (
        <Card className="relative group h-full rounded-3xl border border-white/10 bg-surface/40 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-white/20 cursor-pointer overflow-hidden">
            {/* Hover Gradient Overlay */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-brand via-indigo-500 to-purple-600 pointer-events-none`} />
            
            <div className="relative z-10 flex items-start justify-between">
                <div className="flex flex-1 items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-brand text-white shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300">
                        {developer.avatarUrl ? (
                            <Image
                                alt={developer.name}
                                className="h-full w-full object-cover rounded-2xl"
                                height={56}
                                src={developer.avatarUrl}
                                width={56}
                            />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center text-lg font-bold">
                                {getInitials(developer.name)}
                            </span>
                        )}
                        <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background shadow-sm ${developer.weeklyActivity > 25 ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-white group-hover:text-brand transition-colors">{developer.name}</p>
                        <p className="truncate text-xs font-semibold text-text-secondary uppercase tracking-wider mt-0.5">{formatRole(developer.role)}</p>
                    </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-brand/20 group-hover:border-brand/30 transition-all">
                    <TrendingUp className="h-4 w-4 text-text-secondary group-hover:text-brand transition-colors" />
                </div>
            </div>

            <div className="relative z-10 mt-6 rounded-2xl bg-black/20 p-4 border border-white/5 shadow-inner">
                <div className="flex items-center justify-between text-xs font-bold text-text-secondary uppercase tracking-widest">
                    <span>Weekly Activity</span>
                    <span className={`${activityColor} text-sm font-extrabold`}>
                        {developer.weeklyActivity}%
                    </span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10 shadow-inner relative">
                    <div className={`absolute top-0 bottom-0 left-0 ${progressColor} transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width: `${developer.weeklyActivity}%` }} />
                </div>
                <p className="mt-2 text-xs font-medium text-text-secondary flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${progressColor}`} />
                    {levelLabel}
                </p>
            </div>

            <div className="relative z-10 mt-4 grid grid-cols-3 gap-3">
                <StatBlock icon={GitCommit} label="Commits" value={developer.commits} highlight className="hover:border-emerald-500/30 hover:bg-emerald-500/10" />
                <StatBlock icon={GitPullRequest} label="PRs" value={developer.prs} className="hover:border-blue-500/30 hover:bg-blue-500/10" />
                <StatBlock icon={MessageSquare} label="Reviews" value={developer.reviews} className="hover:border-purple-500/30 hover:bg-purple-500/10" />
            </div>
        </Card>
    );

    if (orgId) {
        return (
            <Link href={`/organization/${orgId}/developers/${developer.githubId}`}>
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}

function StatBlock({
    icon: Icon,
    label,
    value,
    highlight,
    className,
}: {
    icon: any;
    label: string;
    value?: number | null;
    highlight?: boolean;
    className?: string;
}) {
    const displayValue = Number.isFinite(value as number) ? (value as number) : 0;

    return (
        <div className={`rounded-2xl bg-black/20 p-3 text-center border border-white/5 shadow-inner transition-all duration-300 group-hover:scale-[1.02] cursor-default ${className || ""}`}>
            <div className={`flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-sm transition-colors ${highlight ? 'group-hover:bg-brand/20 group-hover:border-brand/30' : ''}`}>
                <Icon className={`h-4 w-4 ${highlight ? 'text-brand' : 'text-text-secondary'} transition-colors`} />
            </div>
            <p className="mt-3 text-lg font-extrabold text-white tracking-tight">{displayValue.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">{label}</p>
        </div>
    );
}
