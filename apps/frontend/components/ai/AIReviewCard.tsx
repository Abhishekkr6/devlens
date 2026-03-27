"use client";

import { AIReview } from '@/lib/aiAPI';
import { AlertCircle, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/Ui/Card';

interface AIReviewCardProps {
    review: AIReview;
}

const severityConfig = {
    low: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    medium: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    high: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    critical: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
};

const categoryColors = {
    bug: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    security: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    performance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'best-practice': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
};

function ScoreGauge({ score }: { score: number }) {
    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-500';
        if (score >= 70) return 'text-lime-500';
        if (score >= 50) return 'text-yellow-500';
        if (score >= 25) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 85) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Fair';
        if (score >= 25) return 'Poor';
        return 'Critical';
    };

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-border"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
                        className={`${getScoreColor(score)} transition-all duration-1000`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {score}
                    </span>
                </div>
            </div>
            <div>
                <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
                    {getScoreLabel(score)}
                </div>
                <div className="text-sm text-text-secondary">
                    Code Quality Score
                </div>
            </div>
        </div>
    );
}

export function AIReviewCard({ review }: AIReviewCardProps) {
    const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

    const toggleIssue = (index: number) => {
        const newExpanded = new Set(expandedIssues);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedIssues(newExpanded);
    };

    return (
        <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-5 sm:p-8 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-colors duration-300 space-y-5 sm:space-y-7">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-5">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                    AI Code Review
                </h3>
                <ScoreGauge score={review.score} />
            </div>

            <div className="relative z-10 bg-surface/40 rounded-2xl p-4 sm:p-5 border border-white/5 shadow-sm">
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-light">{review.summary}</p>
            </div>

            {review.issues && review.issues.length > 0 && (
                <div className="relative z-10 space-y-4">
                    <h4 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary">
                        Issues Found ({review.issues.length})
                    </h4>
                    <div className="space-y-3">
                        {review.issues.map((issue, index) => {
                            const SeverityIcon = severityConfig[issue.severity].icon;
                            const isExpanded = expandedIssues.has(index);

                            return (
                                <div
                                    key={index}
                                    className={`
                    border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm
                    hover:shadow-md
                    ${severityConfig[issue.severity].border}
                    ${severityConfig[issue.severity].bg}
                  `}
                                >
                                    <button
                                        onClick={() => toggleIssue(index)}
                                        className="w-full p-4 sm:p-5 flex items-start gap-4 hover:bg-surface/60 transition-colors"
                                    >
                                        <SeverityIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${severityConfig[issue.severity].color}`} />
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-text-primary">
                                                    {issue.file}:{issue.line}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[issue.category]}`}>
                                                    {issue.category}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${severityConfig[issue.severity].bg} ${severityConfig[issue.severity].color}`}>
                                                    {issue.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm text-text-secondary mt-1">
                                                {issue.message}
                                            </p>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="px-5 pb-5 pl-14 pt-4 border-t border-border/50">
                                            <div className="bg-surface/80 rounded-xl p-4 border border-white/5 shadow-inner">
                                                <p className="text-sm font-bold tracking-tight text-text-primary mb-2 flex items-center gap-2">
                                                    💡 Suggestion
                                                </p>
                                                <p className="text-sm text-text-secondary leading-relaxed font-light">
                                                    {issue.suggestion}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {review.recommendations && review.recommendations.length > 0 && (
                <div className="relative z-10 space-y-4 pt-2">
                    <h4 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary">
                        Recommendations
                    </h4>
                    <ul className="space-y-3">
                        {review.recommendations.map((rec, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-2 text-text-secondary"
                            >
                                <span className="text-brand mt-1">•</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
}
