"use client";

import { create } from "zustand";
import { api } from "../lib/api";
import { isAxiosError } from "axios";

export interface Org {
  _id: string; // MongoDB ID from backend
  id: string;
  name: string;
  slug?: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
}

export interface User {
  id?: string;
  _id?: string;
  login?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  orgIds?: Org[];
  plan?: "free" | "pro";
  subscriptionStatus?: "active" | "expired" | "past_due" | "none";
  subscriptionExpiry?: string | Date;
}

interface UserState {
  user: User | null;
  loading: boolean;
  activeOrgId: string | null;
  activeOrgSlug: string | null;
  fetchUser: (opts?: { silent?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  setActiveOrganization: (id: string, slug?: string) => void;
  removeOrgFromUser: (orgId: string) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  activeOrgId: null,
  activeOrgSlug: null,

  fetchUser: async (opts) => {
    // 1. Recover/Clean orgId from localStorage
    try {
      const stored = localStorage.getItem("orgId");
      if (stored && (stored === "[object Object]" || stored === "undefined" || stored === "null")) {
        console.warn("Cleaning corrupted orgId from localStorage");
        localStorage.removeItem("orgId");
      } else if (stored && !get().activeOrgId) {
        // Hydrate if valid and not already set
        set({ activeOrgId: stored });
      }
    } catch { }

    try {
      if (get().loading === false && opts?.silent) return;

      const res = await api.get("/me");
      const payload = res.data?.data ?? {};
      const rawUser = payload.user ?? null;

      // backend returns org objects (id + name + slug)
      const rawOrgs = Array.isArray(payload.orgs) ? payload.orgs : [];
      type BackendOrg = { _id?: string; id?: string; name: string; slug?: string; role?: "ADMIN" | "MEMBER" | "VIEWER" };

      const orgs: Org[] = rawOrgs.map((o: BackendOrg) => ({
        ...o,
        _id: o._id || o.id || "", // MongoDB _id from backend
        id: o.id || o._id || "",
        slug: o.slug,
        role: o.role || "VIEWER",
      }));

      const activeId = get().activeOrgId ?? (orgs[0]?.id ?? null);
      const activeSlug = activeId ? orgs.find((o: Org) => o.id === activeId)?.slug ?? null : null;

      if (activeId) {
        try {
          localStorage.setItem("orgId", String(activeId));
        } catch { }
      }

      set({
        user: rawUser
          ? {
            ...rawUser,
            orgIds: orgs,
          }
          : null,
        activeOrgId: activeId,
        activeOrgSlug: activeSlug,
        loading: false,
      });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        set({ loading: false });
        return;
      }

      set({
        user: null,
        activeOrgId: null,
        activeOrgSlug: null,
        loading: false,
      });
    }
  },

  setActiveOrganization: (id, slug) => {
    // Safety check: ensure id is a string
    let safeId = id;
    if (typeof id === 'object' && id !== null) {
      // @ts-expect-error - Runtime safety check for legacy/incorrect calls
      safeId = id.id || id._id || String(id);
    }

    // If slug not provided, try to find it from user's orgs
    const { user } = get();
    const orgSlug = slug || user?.orgIds?.find(o => o.id === String(safeId) || o._id === String(safeId))?.slug || null;

    set({ activeOrgId: String(safeId), activeOrgSlug: orgSlug });

    try {
      localStorage.setItem("orgId", String(safeId));
    } catch { }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch { }

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch { }

    set({
      user: null,
      activeOrgId: null,
      activeOrgSlug: null,
      loading: false,
    });

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  },

  removeOrgFromUser: (orgId: string) => {
    const { user, activeOrgId } = get();
    if (!user || !user.orgIds) return;

    const updatedOrgs = user.orgIds.filter((o) => o.id !== orgId);

    let newActiveId = activeOrgId;
    let newActiveSlug = null;

    if (activeOrgId === orgId) {
      if (updatedOrgs.length > 0) {
        newActiveId = updatedOrgs[0].id;
        newActiveSlug = updatedOrgs[0].slug || null;
      } else {
        newActiveId = null;
      }

      if (newActiveId) {
        try {
          localStorage.setItem("orgId", newActiveId);
        } catch { }
      } else {
        try {
          localStorage.removeItem("orgId");
        } catch { }
      }
    } else if (activeOrgId) {
      // Keep existing active slug if we didn't remove the active org
      newActiveSlug = user.orgIds.find(o => o.id === activeOrgId)?.slug || null;
    }

    set({
      user: {
        ...user,
        orgIds: updatedOrgs,
      },
      activeOrgId: newActiveId,
      activeOrgSlug: newActiveSlug,
    });
  },
}));
