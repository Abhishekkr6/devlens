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
  const setActiveOrgId = (id: string) => useUserStore.setState({ activeOrgId: id });

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
    const res = await api.post("/orgs", { name, slug });
    const { org, defaultOrgId } = res.data.data;

    const activeOrgId = defaultOrgId ?? org?._id;
    if (!org?._id || !activeOrgId) {
      throw new Error("Organization payload missing identifiers");
    }

    setActiveOrgId(activeOrgId.toString());
    await fetchOrgs();
    router.push(`/organization/${org._id}/repos`);
  };

  const disabled = name.trim().length === 0 || slug.trim().length === 0;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Organizations</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create a new organization or select from existing ones.
          </p>
        </div>

        <Card className="rounded-2xl border-0 bg-white p-6 shadow-md">
          <div className="space-y-4">
            <div>
              <label htmlFor="org-name" className="text-sm font-medium text-slate-700">
                Organization name
              </label>
              <input
                id="org-name"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="Acme Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="org-slug" className="text-sm font-medium text-slate-700">
                Slug (unique)
              </label>
              <input
                id="org-slug"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="acme-dev"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={createOrg}
              disabled={disabled}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Create organization
            </button>
          </div>
        </Card>

        <Card className="rounded-2xl border-0 bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-slate-900">All organizations</h2>

          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Loading organizations…</p>
          ) : orgs.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No organizations yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              {orgs.map((o) => (
                <li key={o._id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{o.name}</div>
                    <div className="text-xs text-slate-500">{o.slug}</div>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setActiveOrgId(o._id);
                        router.push(`/organization/${o._id}/repos`);
                      }}
                      className="rounded-md bg-indigo-600 px-3 py-1 text-xs text-white"
                    >
                      Open
                    </button>
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
