"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
	ArrowUpRight,
	GitCommit,
	GitPullRequest,
	Settings2,
	Users,
	Activity,
} from "lucide-react";
import DashboardLayout from "../../../../components/Layout/DashboardLayout";
import { Card } from "../../../../components/Ui/Card";
import { Skeleton } from "../../../../components/Ui/Skeleton";
import { api } from "../../../../lib/api";
import { getCachedRepoSummary, RepoSummary } from "../types";
import { useUserStore } from "../../../../store/userStore";

type RepoHealth = "healthy" | "attention" | "warning";

interface MetricValue {
	value: number;
	change: number;
}

interface RepoMetrics {
	totalCommits: MetricValue;
	openPRs: MetricValue;
	contributors: MetricValue;
	churnRate: MetricValue;
}

interface RepoAlertsSummary {
	total: number;
	open: number;
	criticalOpen: number;
}

interface RepoInfo {
	id: string;
	name: string;
	description?: string;
	url?: string;
	language?: string;
	provider?: string;
	health: RepoHealth;
	alerts: RepoAlertsSummary;
	updatedAt?: string;
}

interface RepoContributor {
	githubId?: string;
	name: string;
	commits: number;
	prs: number;
}

interface RepoPullRequest {
	id: string;
	number: number | null;
	title: string;
	authorName: string;
	authorId?: string;
	risk: number;
	state: string;
	reviewers: number;
	updatedAt: string | Date | null;
}

interface RepoDetailResponse {
	repo: RepoInfo;
	metrics: RepoMetrics;
	topContributors: RepoContributor[];
	pullRequests: RepoPullRequest[];
}

interface ApiResponse<T> {
	success: boolean;
	data: T;
	error?: string;
}

const DEFAULT_METRIC: MetricValue = { value: 0, change: 0 };
const EMPTY_DETAIL: RepoDetailResponse = {
	repo: {
		id: "",
		name: "",
		description: "",
		language: undefined,
		provider: undefined,
		url: undefined,
		health: "healthy",
		alerts: { total: 0, open: 0, criticalOpen: 0 },
	},
	metrics: {
		totalCommits: DEFAULT_METRIC,
		openPRs: DEFAULT_METRIC,
		contributors: DEFAULT_METRIC,
		churnRate: DEFAULT_METRIC,
	},
	topContributors: [],
	pullRequests: [],
};

const HEALTH_LABELS: Record<RepoHealth, { label: string; className: string }> = {
	healthy: { label: "good", className: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
	attention: { label: "watch", className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
	warning: { label: "critical", className: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400" },
};

const LANGUAGE_COLORS: Record<string, string> = {
	javascript: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
	typescript: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
	python: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400",
	java: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
	ruby: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
	go: "bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400",
	rust: "bg-stone-100 dark:bg-stone-900/30 text-stone-700 dark:text-stone-400",
	react: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400",
	"c#": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
};

const METRIC_DEFINITIONS: Array<{
	key: keyof RepoMetrics;
	label: string;
	icon: typeof GitCommit;
	format: "number" | "percent";
}> = [
		{ key: "totalCommits", label: "Total Commits", icon: GitCommit, format: "number" },
		{ key: "openPRs", label: "Open PRs", icon: GitPullRequest, format: "number" },
		{ key: "contributors", label: "Contributors", icon: Users, format: "number" },
		{ key: "churnRate", label: "Churn Rate", icon: Activity, format: "percent" },
	];

export default function RepoDetailPage() {
	const params = useParams();
	const repoIdParam = params?.repoId;
	const repoId = Array.isArray(repoIdParam) ? repoIdParam[0] : repoIdParam;

	const [data, setData] = useState<RepoDetailResponse>(EMPTY_DETAIL);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const activeOrgId = useUserStore((state) => state.activeOrgId);
	const userLoading = useUserStore((state) => state.loading);

	useEffect(() => {
		let cancelled = false;

		if (userLoading) {
			return () => {
				cancelled = true;
			};
		}

		const cachedSummary = repoId ? getCachedRepoSummary(repoId) : null;
		if (cachedSummary && !cancelled) {
			setData((previous) => {
				if (previous.repo?.id) {
					return previous;
				}
				return buildDetailFromSummary(cachedSummary);
			});
		}

		const loadDetail = async () => {
			if (!repoId) {
				setError("Missing repository identifier in URL");
				setData(EMPTY_DETAIL);
				setLoading(false);
				return;
			}

			if (!activeOrgId) {
				setError("Select an organization to view repository data");
				setData(EMPTY_DETAIL);
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const response = await api.get<ApiResponse<RepoDetailResponse>>(`/orgs/${activeOrgId}/repos/${repoId}`);
				if (!cancelled) {
					const payload = response.data?.data ?? EMPTY_DETAIL;
					setData({
						repo: payload.repo ?? EMPTY_DETAIL.repo,
						metrics: payload.metrics ?? EMPTY_DETAIL.metrics,
						topContributors: Array.isArray(payload.topContributors) ? payload.topContributors : [],
						pullRequests: Array.isArray(payload.pullRequests) ? payload.pullRequests : [],
					});
				}
			} catch (err) {
				console.warn("Failed to load repository detail", err);
				if (cancelled) {
					return;
				}

				const fallback = cachedSummary ?? (repoId ? getCachedRepoSummary(repoId) : null);

				if (fallback && isAxiosError(err) && err.response?.status === 404) {
					setData(buildDetailFromSummary(fallback));
					setError("Detailed metrics are temporarily unavailable. Showing summary data instead.");
				} else {
					setError("Unable to load this repository right now. Try again in a moment.");
					setData(EMPTY_DETAIL);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		loadDetail();

		return () => {
			cancelled = true;
		};
	}, [repoId, activeOrgId, userLoading]);

	const topContributors = useMemo(() => (Array.isArray(data.topContributors) ? data.topContributors : []), [data.topContributors]);
	const pullRequests = useMemo(() => (Array.isArray(data.pullRequests) ? data.pullRequests : []), [data.pullRequests]);

	const hasRepo = Boolean(data.repo?.id);

	return (
		<DashboardLayout>
			<div className="space-y-7">
				{loading ? (
					<RepoDetailSkeleton />
				) : !hasRepo ? (
					<Card className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-text-secondary shadow-none">
						{error ?? "We could not find this repository."}
					</Card>
				) : (
					<div className="space-y-7">
						{error ? (
							<Card className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/30 p-4 text-sm text-amber-700 dark:text-amber-400 shadow-none">
								{error}
							</Card>
						) : null}
						<HeroSection repo={data.repo} />

						<div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
							<RepositoryMetrics metrics={data.metrics} />
							<TopContributorsCard contributors={topContributors} />
						</div>

						<div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)]">
							<RecentPullRequestsCard pullRequests={pullRequests} repoName={data.repo.name} />
							<RepoActions repo={data.repo} />
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}

function HeroSection({ repo }: { repo: RepoInfo }) {
	const languageKey = repo.language ? repo.language.toLowerCase() : "";
	const languageStyle = LANGUAGE_COLORS[languageKey] ?? "bg-surface text-text-secondary";
	const languageLabel = repo.language ?? (languageKey ? capitalize(languageKey) : "Unknown language");
	const health = HEALTH_LABELS[repo.health] ?? HEALTH_LABELS.healthy;

	return (
		<div className="overflow-hidden rounded-3xl border border-transparent bg-linear-to-r from-indigo-50 via-slate-50 to-blue-50 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-blue-950/20 p-6 shadow-sm">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
				<div className="space-y-4">
					<div className="flex flex-wrap gap-3 text-xs font-semibold">
						<span className={`inline-flex items-center rounded-full px-3 py-1 ${languageStyle}`}>
							{languageLabel}
						</span>
						<span className={`inline-flex items-center rounded-full px-3 py-1 ${health.className}`}>
							{health.label}
						</span>
					</div>
					<div className="space-y-2">
						<h1 className="text-4xl font-semibold text-text-primary">{repo.name || "Repository"}</h1>
						<p className="max-w-3xl text-base text-text-secondary">{repo.description || "No description provided yet."}</p>
					</div>
				</div>
				<div className="flex items-start justify-end">
					<button className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90">
						<Settings2 className="h-4 w-4" /> Configure
					</button>
				</div>
			</div>
		</div>
	);
}

function RepositoryMetrics({ metrics }: { metrics: RepoMetrics }) {
	return (
		<Card className="rounded-3xl border border-border bg-background p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-text-primary">Repository Metrics</h2>
					<p className="text-sm text-text-secondary">Rolling 7-day performance compared to the prior week</p>
				</div>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
				{METRIC_DEFINITIONS.map((definition) => (
					<MetricCard key={definition.key} definition={definition} value={metrics?.[definition.key] ?? DEFAULT_METRIC} />
				))}
			</div>
		</Card>
	);
}

function MetricCard({
	definition,
	value,
}: {
	definition: { key: keyof RepoMetrics; label: string; icon: typeof GitCommit; format: "number" | "percent" };
	value: MetricValue;
}) {
	const Icon = definition.icon;
	const formattedValue = definition.format === "percent" ? `${formatNumber(value.value, 1)}%` : formatNumber(value.value);
	const deltaLabel = formatDelta(value.change);
	const deltaClass = deltaTextClass(value.change);

	return (
		<div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-surface p-5">
			<div className="flex items-center gap-3">
				<span className="rounded-full bg-background p-2 text-brand shadow-sm">
					<Icon className="h-4 w-4" />
				</span>
				<span className="text-sm font-medium text-text-secondary">{definition.label}</span>
			</div>
			<div className="mt-5 space-y-1">
				<div className="text-3xl font-semibold text-text-primary">{formattedValue}</div>
				<div className={`text-xs font-semibold ${deltaClass}`}>{deltaLabel}</div>
			</div>
		</div>
	);
}

function TopContributorsCard({ contributors }: { contributors: RepoContributor[] }) {
	return (
		<Card className="rounded-3xl border border-border bg-background p-6 shadow-sm">
			<h2 className="text-xl font-semibold text-text-primary">Top Contributors</h2>
			<ul className="mt-5 space-y-4">
				{contributors.length === 0 ? (
					<li className="text-sm text-text-secondary">No recent contributor data yet.</li>
				) : (
					contributors.map((contributor, index) => (
						<li key={contributor.githubId ?? contributor.name} className="flex items-center justify-between">
							<div>
								<p className="text-sm font-semibold text-text-primary">{contributor.name}</p>
								<p className="text-xs text-text-secondary">
									{formatNumber(contributor.commits)} commits • {formatNumber(contributor.prs)} PRs
								</p>
							</div>
							<span className="text-xs font-semibold text-text-secondary">#{index + 1}</span>
						</li>
					))
				)}
			</ul>
		</Card>
	);
}

function RecentPullRequestsCard({ pullRequests, repoName }: { pullRequests: RepoPullRequest[]; repoName: string }) {
	return (
		<Card className="rounded-3xl border border-border bg-background p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-text-primary">Recent Pull Requests</h2>
				<span className="text-xs font-semibold text-text-secondary">Past 30 days</span>
			</div>

			<div className="mt-5 overflow-x-auto">
				<table className="min-w-full divide-y divide-border text-left text-sm">
					<thead>
						<tr className="text-xs uppercase tracking-wide text-text-secondary">
							<th className="py-3 pr-4 font-medium">Title</th>
							<th className="py-3 pr-4 font-medium">Repo</th>
							<th className="py-3 pr-4 font-medium">Author</th>
							<th className="py-3 pr-4 font-medium">Risk</th>
							<th className="py-3 pr-4 font-medium">Status</th>
							<th className="py-3 pr-4 font-medium text-right">Reviewers</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border text-text-secondary">
						{pullRequests.length === 0 ? (
							<tr>
								<td className="py-5 text-sm text-text-secondary" colSpan={6}>
									No pull requests recorded yet.
								</td>
							</tr>
						) : (
							pullRequests.map((pr) => (
								<tr key={pr.id} className="transition hover:bg-surface">
									<td className="py-4 pr-4 text-sm font-medium text-text-primary">
										{pr.title}
										{pr.number ? <span className="ml-2 text-xs text-text-secondary">#{pr.number}</span> : null}
									</td>
									<td className="py-4 pr-4 text-sm text-text-secondary">{repoName}</td>
									<td className="py-4 pr-4 text-sm text-text-secondary">{pr.authorName}</td>
									<td className="py-4 pr-4 text-sm">
										<RiskBadge value={pr.risk} />
									</td>
									<td className="py-4 pr-4 text-sm">
										<StatusBadge state={pr.state} />
									</td>
									<td className="py-4 text-right text-sm text-text-secondary">{formatNumber(pr.reviewers)}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</Card>
	);
}

function RepoActions({ repo }: { repo: RepoInfo }) {
	return (
		<div className="space-y-4">
			<Link
				className="flex items-center justify-center gap-2 rounded-3xl bg-brand px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
				href={repo.url || "#"}
				target={repo.url ? "_blank" : undefined}
			>
				View on GitHub <ArrowUpRight className="h-4 w-4" />
			</Link>
			<Card className="rounded-3xl border border-border bg-background p-6 shadow-sm">
				<h3 className="text-base font-semibold text-text-primary">Repository Settings</h3>
				<p className="mt-2 text-sm text-text-secondary">
					Manage branch protections, alerts, and notification settings tailored to this repository.
				</p>
				<button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand/80">
					<Settings2 className="h-4 w-4" /> Manage
				</button>
			</Card>
		</div>
	);
}

function buildDetailFromSummary(summary: RepoSummary): RepoDetailResponse {
	const alertsTotal = summary.alerts?.total ?? 0;
	const alertsCritical = summary.alerts?.critical ?? 0;
	const alertsOpen = Math.max(alertsTotal - alertsCritical, 0);

	return {
		repo: {
			id: summary.id,
			name: summary.name,
			description: summary.description ?? "",
			url: summary.url,
			language: summary.language,
			provider: summary.provider,
			health: summary.health as RepoHealth,
			alerts: {
				total: alertsTotal,
				open: alertsOpen,
				criticalOpen: alertsCritical,
			},
			updatedAt: summary.updatedAt,
		},
		metrics: {
			totalCommits: { value: summary.stats?.commits ?? 0, change: 0 },
			openPRs: { value: summary.stats?.openPRs ?? 0, change: 0 },
			contributors: { value: summary.stats?.contributors ?? 0, change: 0 },
			churnRate: { value: 0, change: 0 },
		},
		topContributors: [],
		pullRequests: [],
	};
}

function RiskBadge({ value }: { value: number }) {
	const severity = value >= 70 ? "high" : value >= 30 ? "medium" : "low";
	const className =
		severity === "high"
			? "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
			: severity === "medium"
				? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
				: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";

	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
			{formatNumber(value)}
		</span>
	);
}

function StatusBadge({ state }: { state: string }) {
	const normalized = state?.toLowerCase() ?? "open";
	const config =
		normalized === "merged"
			? { label: "merged", className: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400" }
			: normalized === "closed"
				? { label: "closed", className: "bg-surface text-text-secondary" }
				: { label: "review", className: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" };

	return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>{config.label}</span>;
}

function RepoDetailSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-40 w-full rounded-3xl" />
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
				<Skeleton className="h-60 w-full rounded-3xl" />
				<Skeleton className="h-60 w-full rounded-3xl" />
			</div>
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)]">
				<Skeleton className="h-64 w-full rounded-3xl" />
				<Skeleton className="h-64 w-full rounded-3xl" />
			</div>
		</div>
	);
}

function formatNumber(value: number, fractionDigits = 0) {
	if (!Number.isFinite(value)) {
		return "0";
	}
	return value.toLocaleString(undefined, {
		maximumFractionDigits: fractionDigits,
		minimumFractionDigits: fractionDigits,
	});
}

function formatDelta(change: number) {
	if (!Number.isFinite(change) || change === 0) {
		return "No change vs last week";
	}

	const formatted = Math.abs(change) >= 1 ? change.toFixed(1) : change.toFixed(2);
	return `${change > 0 ? "+" : ""}${formatted}% vs last week`;
}

function deltaTextClass(change: number) {
	if (!Number.isFinite(change) || change === 0) {
		return "text-text-secondary";
	}
	return change > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
}

function capitalize(value: string) {
	if (!value) return "";
	return value.charAt(0).toUpperCase() + value.slice(1);
}
