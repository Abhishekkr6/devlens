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
    try {
      if (get().loading === false && opts?.silent) return;

      const res = await api.get("/me");
      const payload = res.data?.data ?? {};
      const rawUser = payload.user ?? null;

      // backend returns org objects (id + name)
      const orgs = Array.isArray(payload.orgs) ? payload.orgs : [];

      set({
        user: rawUser
          ? {
            ...rawUser,
            orgIds: orgs,
          }
          : null,
        activeOrgId: get().activeOrgId ?? (orgs[0]?.id ?? null),
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
