"use client";

import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Card } from "./Card";
import { Button } from "./Button";

interface AIStatsWidgetProps {
    stats?: {
        totalAnalyzed: number;
        averageScore: number;
        issuesFound: number;
        highRiskPRs: number;
    };
    loading?: boolean;
}

export function AIStatsWidget({ stats, loading }: AIStatsWidgetProps) {
    if (loading) {
        return (
            <Card className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-surface rounded w-1/2" />
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 bg-surface rounded" />
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    const defaultStats = {
        totalAnalyzed: 0,
        averageScore: 0,
        issuesFound: 0,
        highRiskPRs: 0,
    };

    const data = stats || defaultStats;

    return (
        <Card className="p-4 sm:p-6 border-2 border-brand/20 bg-gradient-to-br from-brand/5 to-purple-500/5 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-brand/20 rounded-lg">
                            <Sparkles className="w-5 h-5 text-brand" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-text-primary">AI Analysis</h3>
                            <p className="text-xs text-text-secondary">Summary</p>
                        </div>
                    </div>
                    <Link href="/organization/[id]/prs">
                        <Button className="text-xs sm:text-sm px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand border-none">
                            View All →
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Total Analyzed */}
                    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] sm:text-xs text-text-secondary font-medium">Analyzed</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-text-primary">{data.totalAnalyzed}</p>
                        <p className="text-[10px] sm:text-xs text-text-secondary mt-1">PRs reviewed</p>
                    </div>

                    {/* Average Score */}
                    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] sm:text-xs text-text-secondary font-medium">Avg Score</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-text-primary">{data.averageScore}/100</p>
                        <p className="text-[10px] sm:text-xs text-text-secondary mt-1">Code quality</p>
                    </div>

                    {/* Issues Found */}
                    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] sm:text-xs text-text-secondary font-medium">Issues</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-text-primary">{data.issuesFound}</p>
                        <p className="text-[10px] sm:text-xs text-text-secondary mt-1">Total found</p>
                    </div>

                    {/* High Risk */}
                    <div className="bg-background/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] sm:text-xs text-text-secondary font-medium">High Risk</span>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-text-primary">{data.highRiskPRs}</p>
                        <p className="text-[10px] sm:text-xs text-text-secondary mt-1">Need attention</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-[10px] sm:text-xs text-text-secondary text-center">
                        Powered by <span className="text-brand font-semibold">Gemini AI</span>
                    </p>
                </div>
            </div>
        </Card>
    );
}
