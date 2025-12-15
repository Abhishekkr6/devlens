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
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);

  const activeOrgId = useUserStore((state) => state.activeOrgId);
  const currentOrgId = orgId ?? activeOrgId ?? null;

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

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Connected repositories</h1>
          <p className="mt-1 text-sm text-slate-500">Repositories linked to this organization.</p>
        </div>

        <Card className="rounded-2xl border-0 bg-white p-6 shadow-md">
          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Loading repositories…</p>
          ) : repos.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No repositories connected yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {repos.map((r) => (
                <li key={r._id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  {r.name}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
