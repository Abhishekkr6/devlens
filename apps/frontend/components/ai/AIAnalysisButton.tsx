"use client";

import { useState } from 'react';
import { useAIStore } from '@/store/aiStore';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIAnalysisButtonProps {
    orgId: string;
    repoId: string;
    prId: string;
    onAnalysisComplete?: () => void;
}

export function AIAnalysisButton({ orgId, repoId, prId, onAnalysisComplete }: AIAnalysisButtonProps) {
    const { analyzePR, loading } = useAIStore();
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (analyzing || loading) return;

        setAnalyzing(true);
        try {
            await analyzePR(orgId, repoId, prId);
            onAnalysisComplete?.();
        } catch (error) {
            // Error already handled by store
            console.error('Analysis failed:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`
                    group relative inline-flex items-center justify-center gap-2 
                    px-6 py-3 rounded-xl font-semibold text-sm
                    bg-gradient-to-r from-brand to-purple-600 
                    text-white shadow-lg shadow-brand/25
                    hover:shadow-xl hover:shadow-brand/40 hover:scale-105
                    active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    transition-all duration-200 cursor-pointer
                `}
        >
            <Sparkles className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform`} />
            {loading ? (
                <span>Analyzing...</span>
            ) : (
                <span>Analyze with AI</span>
            )}
        </button>
    );
}
