"use client";

import { create } from "zustand";
import { api } from "../lib/api";
import { isAxiosError } from "axios";

export interface Org {
  id: string;
  name: string;
}

interface User {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  orgIds?: Org[];
}

interface UserState {
  user: User | null;
  loading: boolean;
  activeOrgId: string | null;
  fetchUser: (opts?: { silent?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  setActiveOrganization: (id: string) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  activeOrgId: null,

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

      // backend returns org objects (id + name)
      const rawOrgs = Array.isArray(payload.orgs) ? payload.orgs : [];
      const orgs = rawOrgs.map((o: any) => ({
        ...o,
        id: o.id || o._id,
      }));

      const activeId = get().activeOrgId ?? (orgs[0]?.id ?? null);

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
        loading: false,
      });
    }
  },

  setActiveOrganization: (id) => {
    // Safety check: ensure id is a string
    let safeId = id;
    if (typeof id === 'object' && id !== null) {
      // @ts-ignore
      safeId = id.id || id._id || String(id);
    }

    set({ activeOrgId: String(safeId) });

    try {
      localStorage.setItem("orgId", String(safeId));
    } catch { }
  },

  logout: async () => {
    try {
      await api.delete("/auth/logout");
    } catch { }

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch { }

    set({
      user: null,
      activeOrgId: null,
      loading: false,
    });
  },
}));
