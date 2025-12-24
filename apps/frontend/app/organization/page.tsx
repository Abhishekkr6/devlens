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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-200">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Choose Organization</h1>
          <p className="mt-2 text-slate-500">
            Select an existing organization or create a new one to get started.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Create Org Card */}
          <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Create New Organization</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Organization Name</label>
                <input
                  className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Acme Inc"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Slug URL</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-400 text-sm">/</span>
                  <input
                    className="w-full rounded-xl border-slate-200 bg-slate-50 pl-7 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
            >
              Create Organization
            </button>
          </Card>

          {/* List Orgs Card */}
          <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Organizations</h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : orgs.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500">No organizations found. Create one above!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {orgs.map((o) => (
                  <li
                    key={o._id}
                    className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 text-lg rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-600">
                        {o.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{o.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{o.slug}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveOrganization(o._id);
                        router.push(`/organization/${o._id}/repos`);
                      }}
                      className="rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-sm"
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
