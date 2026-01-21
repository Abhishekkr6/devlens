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
            disabled={analyzing || loading}
            className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
        transition-all duration-200
        ${analyzing || loading
                    ? 'bg-purple-500/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                }
        text-white shadow-lg hover:shadow-xl
        disabled:opacity-50
      `}
        >
            {analyzing || loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                </>
            ) : (
                <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze with AI</span>
                </>
            )}
        </button>
    );
}
