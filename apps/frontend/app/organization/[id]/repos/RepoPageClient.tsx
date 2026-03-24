"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../lib/api";
import { Card } from "../../../../components/Ui/Card";
import { ConfirmDialog } from "../../../../components/Ui/ConfirmDialog";
import { useUserStore } from "../../../../store/userStore";
import { Search, GitCommit, GitPullRequest, Users, Plus, ShieldCheck } from "lucide-react";
import { Select } from "../../../../components/Ui/Select";
import { Combobox } from "../../../../components/Ui/Combobox";
import { motion, AnimatePresence } from "motion/react";

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
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">Repositories</h1>
          <p className="mt-2 text-sm sm:text-base text-text-secondary font-light">Repositories linked to this organization</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`rounded-2xl border ${showForm ? "border-border bg-surface text-text-secondary" : "border-brand bg-brand text-white shadow-lg shadow-brand/25"} px-5 py-2.5 text-sm font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2`}
          >
            {showForm ? "Cancel" : <><Plus className="w-4 h-4"/> Connect Repository</>}
          </button>
        )}
      </motion.div>

      {/* Connect Form */}
      <AnimatePresence>
      {showForm && (
        <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24, transitionEnd: { overflow: "visible" } }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
            className="relative z-50"
        >
        <Card className="rounded-3xl border border-white/10 bg-surface/80 backdrop-blur-2xl p-6 sm:p-8 shadow-xl relative z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 blur-[80px] rounded-full pointer-events-none" />
          <h3 className="mb-6 text-lg sm:text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand" /> Connect a GitHub Repository
          </h3>
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
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span className="text-sm font-medium text-rose-500 dark:text-rose-400">{connectError}</span>
                {(connectError.toLowerCase().includes("free plan") || connectError.toLowerCase().includes("upgrade")) && (
                  <button 
                    onClick={() => router.push("/pricing")} 
                    className="shrink-0 px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-rose-600 active:scale-95 transition-all"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={isConnecting || !connectParams.fullName}
                className="rounded-xl border border-brand bg-brand px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-brand/90 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none cursor-pointer"
              >
                {isConnecting ? "Connecting..." : "Connect Repository"}
              </button>
            </div>
          </div>
        </Card>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 z-20 relative"
      >
        <div className="relative flex-1 group">
          <Search className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-text-secondary group-focus-within:text-brand transition-colors" />
          <input
            aria-label="Search repositories"
            className="h-12 w-full rounded-2xl border border-white/10 bg-surface/50 backdrop-blur-md pl-11 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-brand/50 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all shadow-sm"
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
      </motion.div>

      {/* Repository Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="rounded-3xl border border-white/5 bg-surface/20 p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-5 w-3/4 rounded-lg bg-slate-200/50 dark:bg-slate-700/50" />
                <div className="h-4 w-full rounded-lg bg-slate-100/50 dark:bg-slate-800/50" />
                <div className="h-4 w-2/3 rounded-lg bg-slate-100/50 dark:bg-slate-800/50" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredRepos.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="rounded-3xl border border-dashed border-border bg-surface/30 p-10 sm:p-16 text-center shadow-none flex flex-col items-center justify-center">
                <GitCommit className="w-12 h-12 text-text-secondary mb-4 opacity-50" />
                <p className="text-base font-medium text-text-primary">
                    {repos.length === 0 ? "No repositories connected." : "No repositories match your filters."}
                </p>
                <p className="text-sm text-text-secondary mt-1 max-w-sm">
                    {repos.length === 0 ? "Connect a GitHub repository above to start tracking code health and activity." : "Try adjusting your search or filters."}
                </p>
            </Card>
        </motion.div>
      ) : (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRepos.map((repo, i) => {
            const healthBadge = getHealthBadge(repo.health);
            return (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                onClick={() => router.push(`/organization/${orgId}/repos/${repo.id}`)}
                className="h-full"
              >
              <Card
                className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-5 sm:p-6 shadow-lg hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)] transition-all duration-300 relative group cursor-pointer h-full flex flex-col"
              >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-brand/10 p-2 rounded-xl border border-brand/20 shrink-0">
                            <GitCommit className="h-5 w-5 text-brand" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-text-primary truncate">{repo.name}</h3>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRepoToDelete(repo);
                          }}
                          className="p-2 -mr-2 text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Disconnect"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
    
                    <p className="text-xs sm:text-sm text-text-secondary mb-5 line-clamp-2 leading-relaxed flex-1">
                      {repo.description || "No description available"}
                    </p>
    
                    <div className="flex items-center gap-2 mb-6">
                      {repo.language && (
                        <span className="inline-flex items-center rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                          {repo.language}
                        </span>
                      )}
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border ${healthBadge.className} border-current/20`}>
                        {healthBadge.text}
                      </span>
                    </div>
    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary p-1.5 rounded-lg border border-transparent hover:bg-surface transition-colors w-1/3 justify-center">
                        <GitCommit className="h-4 w-4 opacity-70" />
                        <span>{repo.stats.commits}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary p-1.5 rounded-lg border border-transparent hover:bg-surface transition-colors w-1/3 justify-center border-l-white/5 border-r-white/5 border-l border-r">
                        <GitPullRequest className="h-4 w-4 opacity-70" />
                        <span>{repo.stats.prs}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary p-1.5 rounded-lg border border-transparent hover:bg-surface transition-colors w-1/3 justify-center">
                        <Users className="h-4 w-4 opacity-70" />
                        <span>{repo.stats.contributors}</span>
                      </div>
                    </div>
                </div>
              </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <ConfirmDialog
        isOpen={!!repoToDelete}
        onClose={() => setRepoToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Disconnect Repository"
        description={`Are you sure you want to disconnect "${repoToDelete?.name}"? This will remove all analyzed data, including commits, PRs, and alerts from DevLens. The actual GitHub repository will not be affected.`}
        confirmText="Disconnect Repository"
        isLoading={isDeletingRepo}
      />
    </div>
  );
}
