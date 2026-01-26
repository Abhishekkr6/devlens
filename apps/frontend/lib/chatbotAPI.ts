"use client";

import { api } from "./api";

export interface ChatMessage {
    message: string;
    response: string;
    intent: string;
    createdAt: Date;
}

export interface ChatQueryRequest {
    query: string;
    orgId: string;
}

export interface ChatQueryResponse {
    message: string;
    intent: string;
    suggestions: string[];
    processingTimeMs: number;
}

export interface ChatbotStatus {
    available: boolean;
    features: {
        naturalLanguageQueries: boolean;
        conversationHistory: boolean;
        intentClassification: boolean;
        dataIntegration: boolean;
    };
    supportedIntents: string[];
}

/**
 * Chatbot API Service
 */
export const chatbotAPI = {
    /**
     * Send a query to the chatbot
     */
    sendQuery: async (request: ChatQueryRequest): Promise<ChatQueryResponse> => {
        const response = await api.post('/chatbot/query', request);
        return response.data.data;
    },

    /**
     * Get conversation history for an organization
     */
    getHistory: async (orgId: string, limit?: number): Promise<ChatMessage[]> => {
        const params = limit ? { limit } : {};
        const response = await api.get(`/chatbot/history/${orgId}`, { params });
        return response.data.data;
    },

    /**
     * Clear conversation history for an organization
     */
    clearHistory: async (orgId: string): Promise<{ deletedCount: number }> => {
        const response = await api.delete(`/chatbot/history/${orgId}`);
        return response.data.data;
    },

    /**
     * Get chatbot status and capabilities
     */
    getStatus: async (): Promise<ChatbotStatus> => {
        const response = await api.get('/chatbot/status');
        return response.data.data;
    }
};
