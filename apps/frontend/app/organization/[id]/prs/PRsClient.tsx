"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, Sparkles, Info } from "lucide-react";
import Link from "next/link";
import { api } from "../../../../lib/api";
import { useLiveStore } from "../../../../store/liveStore";
import { useUserStore } from "../../../../store/userStore";
import { Button } from "../../../../components/Ui/Button";
import { Card } from "../../../../components/Ui/Card";
import { Select } from "../../../../components/Ui/Select";
import { Tooltip } from "../../../../components/Ui/Tooltip";
import { Popover } from "../../../../components/Ui/Popover";
import { AIWelcomeBanner } from "../../../../components/Ui/AIWelcomeBanner";
import { AIStatusBadge } from "../../../../components/Ui/AIStatusBadge";
import { useFirstTimeAIUser } from "../../../../hooks/useFirstTimeAIUser";
import { motion } from "motion/react";

interface Reviewer {
    login?: string;
}

interface PR {
    _id: string;
    title: string;
    number: number;
    state: string;
    riskScore?: number;
    repoName?: string;
    repoId?: string;
    authorName?: string;
    authorGithubId?: string;
    reviewers?: Reviewer[];
    createdAt?: string;
}

type StatusKey = "open" | "review" | "merged" | "draft" | "other";
type RiskLevel = "low" | "medium" | "high" | "unknown";

const UNKNOWN_LABEL = "N/A";

const getRiskAccent = (value?: number) => {
    if (value === undefined || value === null || !Number.isFinite(value)) {
        return "text-slate-400";
    }
    if (value >= 70) return "text-rose-600 dark:text-rose-400 font-semibold";
    if (value >= 40) return "text-amber-600 dark:text-amber-400 font-medium";
    return "text-emerald-600 dark:text-emerald-400 font-medium";
};

const toRiskLevel = (value?: number): RiskLevel => {
    if (value === undefined || value === null || !Number.isFinite(value)) {
        return "unknown";
    }
    if (value >= 70) return "high";
    if (value >= 40) return "medium";
    return "low";
};

const STATUS_BADGE = (state?: string): { text: string; className: string; key: StatusKey } => {
    const key = (state || "").toLowerCase();

    switch (key) {
        case "open":
            return { text: "open", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400", key: "open" };
        case "review":
            return { text: "review", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400", key: "review" };
        case "merged":
            return { text: "merged", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400", key: "merged" };
        case "draft":
            return { text: "draft", className: "bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300", key: "draft" };
        default:
            return {
                text: state || "unknown",
                className: "bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300",
                key: "other",
            };
    }
};

const formatRelativeTime = (value?: string | Date | null) => {
    if (!value) return UNKNOWN_LABEL;

    const date = typeof value === "string" ? new Date(value) : value;
    if (!date || Number.isNaN(date.getTime())) return UNKNOWN_LABEL;

    const reference = new Date();
    const now = reference.getTime();
    const elapsed = now - date.getTime();
    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (elapsed < 60_000) {
        return "just now";
    }

    if (elapsed < 3_600_000) {
        const minutes = Math.round(elapsed / 60_000);
        return formatter.format(-minutes, "minute");
    }

    if (elapsed < 86_400_000) {
        const hours = Math.round(elapsed / 3_600_000);
        return formatter.format(-hours, "hour");
    }

    if (elapsed < 604_800_000) {
        const days = Math.round(elapsed / 86_400_000);
        return formatter.format(-days, "day");
    }

    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (date.getFullYear() !== reference.getFullYear()) {
        options.year = "numeric";
    }

    return date.toLocaleDateString(undefined, options);
};

type StatusFilter = "all" | StatusKey;
type RiskFilter = "all" | RiskLevel;

type FilterOption = {
    label: string;
    value: string;
};

import { ScrollableWithHints } from "../../../../components/Ui/ScrollableWithHints";

type TableRow = {
    id: string;
    title: string;
    number: number;
    repo: string;
    author: string;
    statusText: string;
    statusClass: string;
    statusKey: StatusKey;
    riskValue?: number;
    riskLevel: RiskLevel;
    reviewersCount: number;
    createdAtLabel: string;
};

export default function PRsClient({ orgId }: { orgId: string }) {
    const [prs, setPrs] = useState<PR[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
    const [repoFilter, setRepoFilter] = useState<string>("all");
    const [selectedPrId, setSelectedPrId] = useState<string | null>(null);
    const lastEvent = useLiveStore((state) => state.lastEvent);

    const { user } = useUserStore();
    const { shouldPulse, markAsSeen } = useFirstTimeAIUser();

    useEffect(() => {
        if (!orgId) return;
        let isMounted = true;

        const loadPRs = (isBackgroundPoll = false) => {
            if (!isBackgroundPoll && isMounted) {
                setLoading(true);
            }

            api
                .get(`/orgs/${orgId}/prs`)
                .then((res) => {
                    if (!isMounted) return;
                    setPrs(res.data?.data?.items || []);
                })
                .catch((err) => {
                    console.error("PR load error", err);
                    if (!isMounted) return;
                    setPrs([]);
                })
                .finally(() => {
                    if (!isMounted || isBackgroundPoll) return;
                    setLoading(false);
                });
        };

        loadPRs(false);

        const interval = setInterval(() => loadPRs(true), 60000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [orgId]);

    useEffect(() => {
        if (!lastEvent) return;

        if (lastEvent.type === "PR_UPDATED") {
            Promise.resolve().then(() => {
                setPrs((previous) =>
                    previous.map((pr) =>
                        pr._id === lastEvent.prId
                            ? { ...pr, riskScore: lastEvent.riskScore as number }
                            : pr
                    )
                );
            });
        }
    }, [lastEvent]);

    const tableRows = useMemo<TableRow[]>(() => {
        return prs.map((pr) => {
            const status = STATUS_BADGE(pr.state);
            const rawRisk = pr.riskScore;
            const normalizedRisk =
                rawRisk === undefined || rawRisk === null
                    ? undefined
                    : rawRisk <= 1
                        ? Math.round(rawRisk * 100)
                        : Math.round(rawRisk);

            const repo = pr.repoName?.trim() || pr.repoId || UNKNOWN_LABEL;
            const author = pr.authorName?.trim() || pr.authorGithubId || UNKNOWN_LABEL;
            const reviewersCount = Array.isArray(pr.reviewers) ? pr.reviewers.length : 0;

            return {
                id: pr._id,
                title: pr.title || "Untitled PR",
                number: pr.number,
                repo,
                author,
                statusText: status.text,
                statusClass: status.className,
                statusKey: status.key,
                riskValue: normalizedRisk,
                riskLevel: toRiskLevel(normalizedRisk),
                reviewersCount,
                createdAtLabel: formatRelativeTime(pr.createdAt),
            };
        });
    }, [prs]);

    const repoOptions = useMemo(() => {
        const names = new Set<string>();
        tableRows.forEach((row) => {
            if (row.repo && row.repo !== UNKNOWN_LABEL) {
                names.add(row.repo);
            }
        });
        return Array.from(names).sort((a, b) => a.localeCompare(b));
    }, [tableRows]);

    const filteredRows = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return tableRows.filter((row) => {
            const matchesSearch =
                term.length === 0 ||
                [row.title, row.repo, row.author, `#${row.number}`]
                    .map((value) => `${value}`.toLowerCase())
                    .some((value) => value.includes(term));

            const matchesStatus = statusFilter === "all" || row.statusKey === statusFilter;
            const matchesRisk = riskFilter === "all" || row.riskLevel === riskFilter;
            const matchesRepo = repoFilter === "all" || row.repo === repoFilter;

            return matchesSearch && matchesStatus && matchesRisk && matchesRepo;
        });
    }, [tableRows, searchTerm, statusFilter, riskFilter, repoFilter]);

    const statusOptions: FilterOption[] = [
        { label: "All statuses", value: "all" },
        { label: "Open", value: "open" },
        { label: "Review", value: "review" },
        { label: "Merged", value: "merged" },
        { label: "Draft", value: "draft" },
    ];

    const riskOptions: FilterOption[] = [
        { label: "All risk levels", value: "all" },
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
        { label: "Unknown", value: "unknown" },
    ];

    const repoFilterOptions: FilterOption[] = [
        { label: "All repositories", value: "all" },
        ...repoOptions.map((name) => ({ label: name, value: name })),
    ];

    const renderTableBody = () => {
        if (loading) {
            return (
                <tr>
                    <td colSpan={7} className="px-3 sm:px-6 py-8 sm:py-10 text-center text-xs sm:text-sm text-text-secondary">
                        Loading pull requests...
                    </td>
                </tr>
            );
        }

        if (!filteredRows.length) {
            return (
                <tr>
                    <td colSpan={7} className="px-3 sm:px-6 py-8 sm:py-10 text-center text-xs sm:text-sm text-text-secondary">
                        No pull requests match the current filters.
                    </td>
                </tr>
            );
        }

        return filteredRows.map((row) => {
            const isSelected = row.id === selectedPrId;
            const pr = prs.find(p => p._id === row.id);
            const repoIdString = typeof pr?.repoId === 'string'
                ? pr.repoId
                : (pr?.repoId as any)?._id || String(pr?.repoId || '');
            const prDetailUrl = repoIdString
                ? `/organization/${orgId}/repos/${repoIdString}/pr/${row.id}`
                : '#';

            return (
                <tr
                    key={row.id}
                    className={`group border-b border-border transition-colors last:border-0 hover:bg-surface/50 cursor-pointer ${isSelected ? "bg-surface" : ""
                        }`}
                    onClick={() => setSelectedPrId(row.id)}
                >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="text-xs sm:text-sm font-semibold text-text-primary">{row.title}</div>
                                <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-text-secondary">
                                    #{row.number} - {row.createdAtLabel}
                                </div>
                            </div>
                            <div className="sm:hidden flex-shrink-0">
                                <Tooltip
                                    content={
                                        <div className="text-center">
                                            <div className="font-semibold">✨ AI Code Analysis</div>
                                            <div className="text-[10px] mt-0.5">Get intelligent code review</div>
                                        </div>
                                    }
                                    side="left"
                                >
                                    <Link href={prDetailUrl}>
                                        <Button
                                            aria-label="AI Analysis"
                                            className={`h-9 w-9 rounded-lg px-0 py-0 bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all duration-200 cursor-pointer border border-brand/30 hover:border-brand group/ai ${shouldPulse ? 'animate-pulse' : ''
                                                }`}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                markAsSeen();
                                            }}
                                            variant="ghost"
                                        >
                                            <Sparkles className="h-5 w-5 group-hover/ai:scale-110 transition-transform" />
                                        </Button>
                                    </Link>
                                </Tooltip>
                            </div>
                        </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle text-xs sm:text-sm text-text-secondary whitespace-nowrap">{row.repo}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle text-xs sm:text-sm text-text-secondary whitespace-nowrap">{row.author}</td>
                    <td className={`px-3 sm:px-6 py-3 sm:py-4 align-middle font-mono text-xs sm:text-sm ${getRiskAccent(row.riskValue)}`}>
                        {row.riskValue === undefined ? UNKNOWN_LABEL : row.riskValue}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle">
                        <span className={`inline-flex rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold ${row.statusClass}`}>
                            {row.statusText}
                        </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle text-xs sm:text-sm font-semibold text-text-primary">{row.reviewersCount}</td>
                    {/* AI Icon - Desktop Only (separate column) */}
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-4 align-middle text-right">
                        <Tooltip
                            content={
                                <div className="text-center">
                                    <div className="font-semibold">✨ AI Code Analysis</div>
                                    <div className="text-[10px] mt-0.5">Get intelligent code review</div>
                                </div>
                            }
                            side="left"
                        >
                            <Link href={prDetailUrl}>
                                <Button
                                    aria-label="AI Analysis"
                                    className={`h-10 w-10 sm:h-11 sm:w-11 rounded-lg px-0 py-0 bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all duration-200 cursor-pointer border border-brand/30 hover:border-brand group/ai ${shouldPulse ? 'animate-pulse' : ''
                                        }`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        markAsSeen();
                                    }}
                                    variant="ghost"
                                >
                                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 group-hover/ai:scale-110 transition-transform" />
                                </Button>
                            </Link>
                        </Tooltip>
                    </td>
                </tr>
            );
        });
    };

    return (
        <div className="flex h-full flex-col gap-6 sm:gap-8">
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
            >
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">Pull Requests</h1>
                    <Popover
                        content={
                            <div className="space-y-3 min-w-[280px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-brand" />
                                    <h4 className="font-bold text-base text-text-primary">AI Code Analysis</h4>
                                </div>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    Click the <Sparkles className="w-3 h-3 inline text-brand" /> icon on any PR to get:
                                </p>
                                <ul className="space-y-2 text-xs text-text-secondary">
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">✓</span>
                                        <span><strong>Code Quality Scoring:</strong> Overall quality metrics (0-100)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">✓</span>
                                        <span><strong>Bug Prediction:</strong> AI-powered probability analysis</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">✓</span>
                                        <span><strong>Security Alerts:</strong> Vulnerability detection</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">✓</span>
                                        <span><strong>Recommendations:</strong> Actionable improvements</span>
                                    </li>
                                </ul>
                                <div className="pt-3 border-t border-white/10 mt-3">
                                    <p className="text-[10px] text-text-secondary/70">Powered by Gemini AI</p>
                                    <Link href="/help/ai-analysis" className="text-xs text-brand hover:underline mt-1 inline-block font-medium">
                                        Learn more &rarr;
                                    </Link>
                                </div>
                            </div>
                        }
                        side="bottom"
                        align="start"
                    >
                        <button className="p-1.5 hover:bg-surface rounded-xl transition-colors bg-surface/50 border border-white/5" aria-label="AI Analysis Info">
                            <Info className="w-5 h-5 text-text-secondary hover:text-brand transition-colors" />
                        </button>
                    </Popover>
                </div>
                <p className="text-sm sm:text-base text-text-secondary font-light">
                    Team pull requests with risk scoring and review metrics for this organization
                </p>
            </motion.header>

            <AIWelcomeBanner />


            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between z-20 relative"
            >
                <div className="relative w-full lg:max-w-md group">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary group-focus-within:text-brand transition-colors" />
                    <input
                        aria-label="Search pull requests"
                        className="h-12 w-full rounded-2xl border border-white/10 bg-surface/50 backdrop-blur-md pl-12 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-brand/50 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all shadow-sm"
                        placeholder="Search pull requests..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        type="search"
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
                    <Select
                        containerClassName="sm:w-44"
                        onChange={(value) => setStatusFilter(value as StatusFilter)}
                        options={statusOptions}
                        value={statusFilter}
                    />
                    <Select
                        containerClassName="sm:w-44"
                        onChange={(value) => setRiskFilter(value as RiskFilter)}
                        options={riskOptions}
                        value={riskFilter}
                    />
                    <Select
                        containerClassName="sm:w-56"
                        onChange={(value) => setRepoFilter(value)}
                        options={repoFilterOptions}
                        value={repoFilter}
                    />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card className="overflow-hidden rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl shadow-xl">
                    <ScrollableWithHints>
                        <table className="min-w-full table-auto text-xs sm:text-sm text-text-secondary">
                            <thead className="bg-surface/80 text-left text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-white/5">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">Title</th>
                                    <th className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">Repo</th>
                                    <th className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">Author</th>
                                    <th className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">Risk</th>
                                    <th className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">Status</th>
                                    <th className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap text-center">Reviewers</th>
                                    <th className="px-4 sm:px-6 py-4 sm:py-5" aria-label="Open" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">{renderTableBody()}</tbody>
                        </table>
                    </ScrollableWithHints>
                </Card>
            </motion.div>
        </div>
    );
}
