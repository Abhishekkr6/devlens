"use client";

import { create } from 'zustand';
import { aiAPI, AIAnalysisResult, AIInsight, SecurityAlert, AIStatus } from '../lib/aiAPI';
import { toast } from 'sonner';

interface AIStore {
    // State
    analysis: AIAnalysisResult | null;
    insights: AIInsight[];
    securityAlerts: SecurityAlert[];
    aiStatus: AIStatus | null;
    loading: boolean;
    error: string | null;

    // Actions
    analyzePR: (orgId: string, repoId: string, prId: string) => Promise<void>;
    fetchInsights: (prId: string) => Promise<void>;
    fetchSecurityAlerts: (repoId: string, status?: string) => Promise<void>;
    resolveAlert: (alertId: string) => Promise<void>;
    checkAIStatus: () => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
    // Initial state
    analysis: null,
    insights: [],
    securityAlerts: [],
    aiStatus: null,
    loading: false,
    error: null,

    // Analyze PR with AI
    analyzePR: async (orgId: string, repoId: string, prId: string) => {
        set({ loading: true, error: null });

        try {
            const result = await aiAPI.analyzePR({ orgId, repoId, prId });
            set({ analysis: result, loading: false });

            toast.success('AI analysis completed!', {
                description: `Overall score: ${result.overallScore}/100`
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || error.message || 'AI analysis failed';
            set({ error: errorMessage, loading: false });

            toast.error('AI analysis failed', {
                description: errorMessage
            });

            throw error;
        }
    },

    // Fetch AI insights for a PR
    fetchInsights: async (prId: string) => {
        set({ loading: true, error: null });

        try {
            const insights = await aiAPI.getInsights(prId);
            set({ insights, loading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to fetch insights';
            set({ error: errorMessage, loading: false });
            console.error('Failed to fetch insights:', error);
        }
    },

    // Fetch security alerts for a repository
    fetchSecurityAlerts: async (repoId: string, status?: string) => {
        set({ loading: true, error: null });

        try {
            const alerts = await aiAPI.getSecurityAlerts(repoId, status);
            set({ securityAlerts: alerts, loading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to fetch security alerts';
            set({ error: errorMessage, loading: false });
            console.error('Failed to fetch security alerts:', error);
        }
    },

    // Resolve a security alert
    resolveAlert: async (alertId: string) => {
        try {
            const resolvedAlert = await aiAPI.resolveSecurityAlert(alertId);

            // Update the alert in the list
            set(state => ({
                securityAlerts: state.securityAlerts.map(alert =>
                    alert._id === alertId ? resolvedAlert : alert
                )
            }));

            toast.success('Security alert resolved');
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to resolve alert';
            toast.error('Failed to resolve alert', {
                description: errorMessage
            });
            throw error;
        }
    },

    // Check AI service status
    checkAIStatus: async () => {
        try {
            const status = await aiAPI.getStatus();
            set({ aiStatus: status });
        } catch (error: any) {
            console.error('Failed to check AI status:', error);
            set({ aiStatus: null });
        }
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },

    // Reset store
    reset: () => {
        set({
            analysis: null,
            insights: [],
            securityAlerts: [],
            loading: false,
            error: null
        });
    }
}));
