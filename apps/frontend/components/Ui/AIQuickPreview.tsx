"use client";

import { Sparkles, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { useState } from "react";

interface AIQuickPreviewProps {
    prId: string;
    analysis?: {
        score?: number;
        issuesCount?: number;
        bugProbability?: string;
        status?: string;
    };
}

export function AIQuickPreview({ prId, analysis }: AIQuickPreviewProps) {
    const [isVisible, setIsVisible] = useState(false);

    if (!analysis) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {/* Trigger - invisible overlay */}
            <div className="absolute inset-0 z-10" />

            {/* Preview Card */}
            {isVisible && (
                <div className="absolute left-full ml-2 top-0 z-50 w-64 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 p-4 animate-in fade-in-0 slide-in-from-left-2 pointer-events-none">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700">
                        <Sparkles className="w-4 h-4 text-brand" />
                        <h4 className="font-semibold text-sm">AI Analysis Preview</h4>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2.5">
                        {/* Score */}
                        {analysis.score !== undefined && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-xs text-slate-300">Quality Score</span>
                                </div>
                                <span className={`text-sm font-bold ${getScoreColor(analysis.score)}`}>
                                    {analysis.score}/100
                                </span>
                            </div>
                        )}

                        {/* Issues */}
                        {analysis.issuesCount !== undefined && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                                    <span className="text-xs text-slate-300">Issues Found</span>
                                </div>
                                <span className="text-sm font-bold text-orange-400">
                                    {analysis.issuesCount}
                                </span>
                            </div>
                        )}

                        {/* Bug Probability */}
                        {analysis.bugProbability && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                    <span className="text-xs text-slate-300">Bug Risk</span>
                                </div>
                                <span className="text-sm font-bold text-slate-200">
                                    {analysis.bugProbability}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-slate-700">
                        <p className="text-[10px] text-slate-400 text-center">
                            Click AI icon for full details →
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
