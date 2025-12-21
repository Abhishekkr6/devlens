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
  defaultOrgId?: string | null;
}

interface UserState {
  user: User | null;
  loading: boolean;
  activeOrgId: string | null;
  fetchUser: (opts?: { silent?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  setActiveOrganization: (orgId: string) => void;
}


export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  activeOrgId:
    typeof window !== "undefined"
      ? localStorage.getItem("activeOrgId")
      : null,

  setActiveOrganization: (orgId: string) => {
    localStorage.setItem("activeOrgId", orgId);
    set({ activeOrgId: orgId });
  },

  fetchUser: async (opts) => {
    try {
      // prevent double calls
      if (get().loading === false && opts?.silent) return;

      const res = await api.get("/me");
      const payload = res.data?.data ?? {};
      const rawUser = payload.user ?? null;

      if (rawUser) {
        rawUser.orgIds = payload.orgs;
      }

      set({
        user: rawUser,
        loading: false,
      });
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;

        // 🚫 DO NOT logout on first 401
        if (status === 401) {
          set((s) => ({
            ...s,
            loading: false,
          }));
          return;
        }
      }

      set({
        user: null,
        activeOrgId: null,
        loading: false,
      });
    }
  },

  logout: async () => {
    try {
      await api.delete("/auth/logout");
    } catch {}

    // logout is the ONLY place we hard reset
    try {
      localStorage.removeItem("activeOrgId");
      sessionStorage.clear();
    } catch {}

    set({
      user: null,
      activeOrgId: null,
      loading: false,
    });
  },
}));
