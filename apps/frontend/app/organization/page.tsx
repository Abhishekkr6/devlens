"use client";

import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { useRouter } from "next/navigation";
import { Card } from "../../components/Ui/Card";
import { useUserStore } from "../../store/userStore";

export default function OrganizationPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setActiveOrganization } = useUserStore();

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orgs");
      setOrgs(res.data.data || []);
    } catch (e) {
      console.error("Failed to load organizations", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const createOrg = async () => {
    if (!name.trim() || !slug.trim()) return;

    const res = await api.post("/orgs", { name, slug });
    const { org, defaultOrgId } = res.data.data;

    const activeOrgId = defaultOrgId ?? org?._id;
    if (!org?._id || !activeOrgId) {
      throw new Error("Invalid organization response");
    }

    setActiveOrganization(activeOrgId.toString());
    await fetchOrgs();
    router.push(`/organization/${org._id}/repos`);
  };

  const disabled = !name.trim() || !slug.trim();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-200/50 dark:shadow-none">
            <svg className="w-6 h-6 text-white dark:text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Choose Organization</h1>
          <p className="mt-2 text-text-secondary">
            Select an existing organization or create a new one to get started.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Create Org Card */}
          <Card className="rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Create New Organization</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Organization Name</label>
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="e.g. Acme Inc"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">Slug URL</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-text-secondary text-sm">/</span>
                  <input
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 pl-7 pr-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="acme-inc"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <button
              onClick={createOrg}
              disabled={disabled}
              className="mt-4 w-full rounded-xl bg-text-primary px-4 py-3 text-sm font-semibold text-background shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              Create Organization
            </button>
          </Card>

          {/* List Orgs Card */}
          <Card className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Your Organizations</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : orgs.length === 0 ? (
              <div className="text-center py-8 bg-surface rounded-xl border border-dashed border-border">
                <p className="text-sm text-text-secondary">No organizations found. Create one above!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {orgs.map((o) => (
                  <li
                    key={o._id}
                    className="group flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-all hover:border-brand/40 hover:bg-brand/5 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 text-lg rounded-lg bg-background border border-border flex items-center justify-center font-bold text-text-secondary shadow-sm group-hover:border-brand/40 group-hover:text-brand">
                        {o.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">{o.name}</div>
                        <div className="text-xs text-text-secondary font-mono">{o.slug}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveOrganization(o._id);
                        router.push(`/organization/${o._id}/repos`);
                      }}
                      className="rounded-lg bg-background border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:border-brand hover:text-brand transition-colors shadow-sm"
                    >
                      Launch
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
