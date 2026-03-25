"use client";

import axios from "axios";

const DEFAULT_LOCAL_BASE = "http://localhost:4000/api/v1";
const DEFAULT_REMOTE_BASE = "https://DevLens-w2s8.onrender.com/api/v1";

const pickEnvBase = (): string | undefined => {
  const candidates = [
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.BACKEND_URL,
    process.env.API_BASE_URL,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
};

const resolveBaseURL = (): string => {
  // In the browser, always use same-origin path so Next rewrites proxy
  if (typeof window !== "undefined") {
    return "/api/v1";
  }

  // On the server, allow env override for direct backend calls
  const envBase = pickEnvBase();
  if (envBase) {
    return envBase.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    return DEFAULT_REMOTE_BASE;
  }

  return DEFAULT_LOCAL_BASE;
};

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true
});

// Remove localStorage token usage; rely on httpOnly cookie only
api.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = resolveBaseURL();
  }
  config.withCredentials = true;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Don't redirect if already on a public page to prevent infinite loop or bouncing unauthenticated traffic
        const publicPaths = ["/", "/pricing", "/features", "/how-it-works", "/privacy", "/terms", "/github"];
        if (publicPaths.includes(window.location.pathname)) {
          console.log("[api] 401 on public page, skipping redirect to prevent loop");
          return Promise.reject(error);
        }

        // Clear everything locally
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to login
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export const getBackendBase = (): string => resolveBaseURL();

export const deleteAccount = async (): Promise<boolean> => {
  try {
    const res = await api.delete("/auth/logout");
    return Boolean(res?.data?.success);
  } catch (err) {
    console.error("Delete account failed", err);
    return false;
  }
};
