"use client";

import { Sparkles, CheckCircle2, Clock } from "lucide-react";

interface AIStatusBadgeProps {
    hasAnalysis?: boolean;
    score?: number;
    size?: "sm" | "md";
}

export function AIStatusBadge({ hasAnalysis, score, size = "md" }: AIStatusBadgeProps) {
    if (!hasAnalysis) {
        return (
            <div
                className={`inline-flex items-center gap-1 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 ${size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"
                    }`}
            >
                <Clock className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
                <span>Not Analyzed</span>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500 bg-green-500/10 border-green-500/20";
        if (score >= 60) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
        return "text-red-500 bg-red-500/10 border-red-500/20";
    };

    return (
        <div
            className={`inline-flex items-center gap-1 rounded-full border ${score ? getScoreColor(score) : "text-brand bg-brand/10 border-brand/20"
                } ${size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"}`}
        >
            {score ? (
                <>
                    <CheckCircle2 className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
                    <span className="font-semibold">{score}/100</span>
                </>
            ) : (
                <>
                    <Sparkles className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
                    <span>Analyzed</span>
                </>
            )}
        </div>
    );
}
