"use client";

import { useState, useEffect } from "react";
import { api } from "../../../../lib/api";
import { Card } from "../../../../components/Ui/Card";
import { useUserStore } from "../../../../store/userStore";

type Repo = {
  _id: string;
  name: string;
};

export default function RepoPageClient({ orgId }: { orgId?: string }) {
  const [connectParams, setConnectParams] = useState({ fullName: "" });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeOrgId = useUserStore((state) => state.activeOrgId);
  const user = useUserStore((state) => state.user);
  const currentOrgId = orgId ?? activeOrgId ?? null;

  // Find users role in current org
  const currentOrg = user?.orgIds?.find((o) => String(o.id) === String(currentOrgId));
  const userRole = currentOrg?.role || "VIEWER";
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    if (!currentOrgId) return;

    const fetchRepos = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orgs/${currentOrgId}/repos`);
        setRepos(res.data.data || []);
      } catch (err) {
        console.error("Repo load failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [currentOrgId]);

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
      // Refresh list
      const res = await api.get(`/orgs/${currentOrgId}/repos`);
      setRepos(res.data.data || []);
    } catch (err: any) {
      console.error("Connect failed", err);
      setConnectError(err.response?.data?.error || "Failed to connect repository");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDelete = async (repoId: string) => {
    if (!confirm("Are you sure you want to delete this repository? This action cannot be undone.")) return;

    try {
      setDeletingId(repoId);
      await api.delete(`/orgs/${currentOrgId}/repos/${repoId}`);
      // Refresh list
      const res = await api.get(`/orgs/${currentOrgId}/repos`);
      setRepos(res.data.data || []);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete repository");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Connected repositories</h1>
            <p className="mt-1 text-sm text-slate-500">Repositories linked to this organization.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {showForm ? "Cancel" : "Connect Repository"}
            </button>
          )}
        </div>

        {showForm && (
          <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-slate-900">Connect a GitHub Repository</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Repository Full Name (owner/repo)</label>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="facebook/react"
                  value={connectParams.fullName}
                  onChange={(e) => setConnectParams({ ...connectParams, fullName: e.target.value })}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Ensure the TeamPulse GitHub App is installed on this repository.
                </p>
              </div>

              {connectError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {connectError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !connectParams.fullName}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isConnecting ? "Connecting..." : "Connect Repository"}
                </button>
              </div>
            </div>
          </Card>
        )}

        <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Loading repositories…</p>
          ) : repos.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No repositories connected</h3>
              <p className="mt-1 text-sm text-slate-500">
                Get started by connecting a new repository.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Connect Repository
                </button>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {repos.map((r) => (
                <li key={r._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-900">{r.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Connected
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(r._id)}
                        disabled={deletingId === r._id}
                        className="text-slate-400 hover:text-red-600 disabled:opacity-50"
                        title="Disconnect Repository"
                      >
                        {deletingId === r._id ? (
                          <span className="animate-spin">...</span>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
