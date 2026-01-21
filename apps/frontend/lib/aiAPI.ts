"use client";

import { api } from "./api";

export interface AIAnalysisRequest {
    orgId: string;
    repoId: string;
    prId: string;
}

export interface AIIssue {
    file: string;
    line: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'bug' | 'security' | 'style' | 'performance' | 'best-practice';
    message: string;
    suggestion: string;
}

export interface AIReview {
    score: number;
    issues: AIIssue[];
    summary: string;
    recommendations: string[];
}

export interface QualityMetrics {
    maintainabilityIndex: number;
    cyclomaticComplexity: number;
    linesOfCode: number;
    codeSmells: number;
    technicalDebtMinutes: number;
    halsteadMetrics: {
        volume: number;
        difficulty: number;
        effort: number;
    };
    grade: string;
}

export interface BugProbability {
    probability: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    recommendation: string;
}

export interface AIAnalysisResult {
    overallScore: number;
    aiReview: AIReview;
    qualityMetrics: QualityMetrics;
    bugProbability: BugProbability | null;
    recommendations: string[];
    processingTimeMs: number;
}

export interface AIInsight {
    _id: string;
    prId: string;
    repoId: string;
    type: 'code-review' | 'security-scan' | 'quality-analysis' | 'bug-prediction';
    provider: 'gemini' | 'huggingface' | 'github';
    score: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    issues: AIIssue[];
    summary: string;
    recommendations: string[];
    metadata: Record<string, any>;
    analyzedAt: Date;
    processingTimeMs: number;
}

export interface SecurityAlert {
    _id: string;
    repoId: string;
    prId?: string;
    type: 'vulnerability' | 'secret' | 'dependency' | 'code-smell';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    affectedFiles: string[];
    affectedLines: number[];
    cwe?: string;
    cve?: string;
    cvssScore?: number;
    recommendations: string[];
    status: 'open' | 'acknowledged' | 'resolved' | 'false-positive';
    detectedAt: Date;
    detectedBy: 'gemini' | 'github' | 'manual';
}

export interface AIStatus {
    aiAvailable: boolean;
    provider: string;
    features: {
        codeReview: boolean;
        qualityMetrics: boolean;
        securityScan: boolean;
        bugPrediction: boolean;
    };
}

/**
 * AI API Service
 */
export const aiAPI = {
    /**
     * Trigger AI analysis for a PR
     */
    analyzePR: async (request: AIAnalysisRequest): Promise<AIAnalysisResult> => {
        const response = await api.post('/ai/analyze-pr', request);
        return response.data.data;
    },

    /**
     * Get AI insights for a PR
     */
    getInsights: async (prId: string): Promise<AIInsight[]> => {
        const response = await api.get(`/ai/insights/${prId}`);
        return response.data.data;
    },

    /**
     * Get quality metrics for a repository
     */
    getQualityMetrics: async (repoId: string): Promise<QualityMetrics[]> => {
        const response = await api.get(`/ai/quality/${repoId}`);
        return response.data.data;
    },

    /**
     * Get security alerts for a repository
     */
    getSecurityAlerts: async (repoId: string, status?: string): Promise<SecurityAlert[]> => {
        const params = status ? { status } : {};
        const response = await api.get(`/ai/security/${repoId}`, { params });
        return response.data.data;
    },

    /**
     * Resolve a security alert
     */
    resolveSecurityAlert: async (alertId: string): Promise<SecurityAlert> => {
        const response = await api.patch(`/ai/security/${alertId}/resolve`);
        return response.data.data;
    },

    /**
     * Check AI service status
     */
    getStatus: async (): Promise<AIStatus> => {
        const response = await api.get('/ai/status');
        return response.data.data;
    }
};
