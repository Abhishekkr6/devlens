"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../lib/api";
import { Card } from "../../../../components/Ui/Card";
import { ConfirmDialog } from "../../../../components/Ui/ConfirmDialog";
import { useUserStore } from "../../../../store/userStore";
import { Search, GitCommit, GitPullRequest, Users } from "lucide-react";
import { Select } from "../../../../components/Ui/Select";
import { Combobox } from "../../../../components/Ui/Combobox";

type Repo = {
  id: string;
  name: string;
  description?: string;
  language?: string;
  health: "healthy" | "warning" | "attention";
  stats: {
    commits: number;
    prs: number;
    contributors: number;
  };
};

export default function RepoPageClient({ orgId }: { orgId: string }) {
  const router = useRouter();
  const [connectParams, setConnectParams] = useState({ fullName: "" });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // GitHub repositories state
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [fetchReposError, setFetchReposError] = useState<string | null>(null);

  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState<Repo | null>(null);
  const [isDeletingRepo, setIsDeletingRepo] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");

  const user = useUserStore((state) => state.user);

  const currentOrgId = orgId;
  const currentOrg = user?.orgIds?.find((o: { _id?: string; role?: string }) => String(o._id) === String(currentOrgId));
  const userRole = currentOrg?.role || "VIEWER";
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    if (!currentOrgId) return;

    const fetchRepos = async (isBackgroundPoll = false) => {
      try {
        if (!isBackgroundPoll) {
          setLoading(true);
        }
        const res = await api.get(`/orgs/${currentOrgId}/repos`);
        setRepos(res.data.data || []);
      } catch (err) {
        console.error("Repo load failed", err);
      } finally {
        if (!isBackgroundPoll) {
          setLoading(false);
        }
      }
    };

    fetchRepos(false);
    const interval = setInterval(() => fetchRepos(true), 45000);
    return () => clearInterval(interval);
  }, [currentOrgId]);

  // Fetch GitHub repositories when form opens
  useEffect(() => {
    if (showForm && currentOrgId) {
      fetchGithubRepos();
    }
  }, [showForm, currentOrgId]);

  const fetchGithubRepos = async () => {
    try {
      setIsFetchingRepos(true);
      setFetchReposError(null);
      const res = await api.get(`/orgs/${currentOrgId}/github/repos`);
      setGithubRepos(res.data.data || []);
    } catch (err: any) {
      console.error("Failed to fetch GitHub repos", err);
      setFetchReposError(err.response?.data?.error || "Failed to fetch repositories from GitHub");
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const handleConnect = async () => {
    if (!currentOrgId || !connectParams.fullName) return;

    try {
      setIsConnecting(true);
      setConnectError(null);
      await api.post(`/orgs/${currentOrgId}/repos/connect`, {
        repoFullName: connectParams.fullName,
      });

      setConnectParams({ fullName: "" });
      setShowForm(false);
      const res = await api.get(`/orgs/${currentOrgId}/repos`);
      setRepos(res.data.data || []);
    } catch (err: any) {
      console.error("Connect failed", err);
      if (err.response?.status === 409) {
        setConnectError("Repository is already connected to this organization.");
      } else {
        setConnectError(err.response?.data?.error || "Failed to connect repository");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!repoToDelete || !currentOrgId) return;

    try {
      setIsDeletingRepo(true);
      await api.delete(`/orgs/${currentOrgId}/repos/${repoToDelete.id}`);
      const res = await api.get(`/orgs/${currentOrgId}/repos`);
      setRepos(res.data.data || []);
      setRepoToDelete(null);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete repository");
    } finally {
      setIsDeletingRepo(false);
    }
  };

  // Get unique languages for filter
  const languages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach(r => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs).sort();
  }, [repos]);

  // Filter repos
  const filteredRepos = useMemo(() => {
    return repos.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLanguage = languageFilter === "all" || repo.language === languageFilter;
      const matchesHealth = healthFilter === "all" || repo.health === healthFilter;
      return matchesSearch && matchesLanguage && matchesHealth;
    });
  }, [repos, searchTerm, languageFilter, healthFilter]);

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "healthy":
        return { text: "Healthy", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
      case "warning":
        return { text: "Warning", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" };
      case "attention":
        return { text: "Attention", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" };
      default:
        return { text: "Unknown", className: "bg-slate-500/10 text-slate-700 dark:text-slate-400" };
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary">Repositories</h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">Repositories linked to this organization</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl border border-border px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-text-primary hover:bg-brand/90 cursor-pointer disabled:opacity-50"
          >
            {showForm ? "Cancel" : "Connect Repository"}
          </button>
        )}
      </div>

      {/* Connect Form */}
      {showForm && (
        <Card className="rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-base sm:text-lg font-medium text-text-primary">Connect a GitHub Repository</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-text-secondary">Select Repository</label>
              <Combobox
                options={githubRepos.map((repo) => ({
                  value: repo.full_name,
                  label: repo.full_name,
                  description: repo.description || "No description",
                  metadata: repo,
                }))}
                value={connectParams.fullName}
                onChange={(value) => setConnectParams({ ...connectParams, fullName: value })}
                placeholder="Select a repository"
                searchPlaceholder="Search repositories..."
                loading={isFetchingRepos}
                className="mt-1"
                emptyMessage={fetchReposError || "No repositories found"}
              />
              <p className="mt-1 text-[10px] sm:text-xs text-text-secondary">
                {isFetchingRepos ? "Loading your repositories..." : "Select a repository from your GitHub account."}
              </p>
            </div>

            {fetchReposError && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 p-3 text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                {fetchReposError}
              </div>
            )}

            {connectError && (
              <div className="rounded-lg bg-red-50 dark:bg-rose-900/30 p-3 text-xs sm:text-sm text-red-600 dark:text-red-400">
                {connectError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-border px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-text-secondary hover:bg-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={isConnecting || !connectParams.fullName}
                className="rounded-xl border border-brand px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50 cursor-pointer"
              >
                {isConnecting ? "Connecting..." : "Connect Repository"}
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            aria-label="Search repositories"
            className="h-10 sm:h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-xs sm:text-sm text-text-secondary placeholder:text-text-secondary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search repositories..."
            type="search"
            value={searchTerm}
          />
        </div>

        <Select
          containerClassName="w-full sm:w-40"
          options={[
            { label: "Language", value: "all" },
            ...languages.map(lang => ({ label: lang, value: lang }))
          ]}
          value={languageFilter}
          onChange={(val) => setLanguageFilter(val)}
        />

        <Select
          containerClassName="w-full sm:w-40"
          options={[
            { label: "Health", value: "all" },
            { label: "Healthy", value: "healthy" },
            { label: "Warning", value: "warning" },
            { label: "Attention", value: "attention" }
          ]}
          value={healthFilter}
          onChange={(val) => setHealthFilter(val)}
        />
      </div>

      {/* Repository Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="rounded-2xl border border-border bg-background p-4 sm:p-5 shadow-sm">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredRepos.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-border bg-surface p-8 sm:p-12 text-center shadow-none">
          <p className="text-xs sm:text-sm text-text-secondary">
            {repos.length === 0 ? "No repositories connected. Connect a repository to get started." : "No repositories match your filters."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo) => {
            const healthBadge = getHealthBadge(repo.health);
            return (
              <Card
                key={repo.id}
                className="rounded-2xl border border-border bg-background p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push(`/organization/${orgId}/repos/${repo.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <GitCommit className="h-4 w-4 text-text-secondary shrink-0" />
                    <h3 className="text-sm sm:text-base font-semibold text-text-primary truncate">{repo.name}</h3>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRepoToDelete(repo);
                      }}
                      className="text-text-secondary hover:text-red-600 cursor-pointer ml-2"
                      title="Disconnect"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <p className="text-[10px] sm:text-xs text-text-secondary mb-3 line-clamp-2">
                  {repo.description || "No description available"}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  {repo.language && (
                    <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-blue-700 dark:text-blue-400">
                      {repo.language}
                    </span>
                  )}
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] sm:text-xs font-medium ${healthBadge.className}`}>
                    {healthBadge.text}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-text-secondary">
                    <GitCommit className="h-3 w-3" />
                    <span>{repo.stats.commits}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-text-secondary">
                    <GitPullRequest className="h-3 w-3" />
                    <span>{repo.stats.prs}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-text-secondary">
                    <Users className="h-3 w-3" />
                    <span>{repo.stats.contributors}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!repoToDelete}
        onClose={() => setRepoToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Disconnect Repository"
        description={`Are you sure you want to disconnect "${repoToDelete?.name}"? This will remove all analyzed data, including commits, PRs, and alerts from TeamPulse. The actual GitHub repository will not be affected.`}
        confirmText="Disconnect Repository"
        isLoading={isDeletingRepo}
      />
    </div>
  );
}
