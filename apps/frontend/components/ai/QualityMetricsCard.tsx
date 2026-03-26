"use client";

import { QualityMetrics } from '@/lib/aiAPI';
import { Code2, AlertCircle, Clock } from 'lucide-react';
import { Card } from '@/components/Ui/Card';

interface QualityMetricsCardProps {
    metrics: QualityMetrics;
}

function GradeBadge({ grade }: { grade: string }) {
    const gradeColors = {
        'A': 'bg-green-500 text-white',
        'B': 'bg-lime-500 text-white',
        'C': 'bg-yellow-500 text-white',
        'D': 'bg-orange-500 text-white',
        'F': 'bg-red-500 text-white'
    };

    return (
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-2xl font-bold ${gradeColors[grade as keyof typeof gradeColors] || gradeColors.F}`}>
            {grade}
        </div>
    );
}

function MetricBar({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-text-secondary">{label}</span>
                <span className="font-medium text-text-primary">{value}</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-1000 ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export function QualityMetricsCard({ metrics }: QualityMetricsCardProps) {
    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <Card className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-text-primary">
                    Code Quality Metrics
                </h3>
                <GradeBadge grade={metrics.grade} />
            </div>

            {/* Maintainability Index */}
            <div className="bg-gradient-to-r from-brand/10 to-blue-500/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary">
                        Maintainability Index
                    </span>
                    <span className="text-2xl font-bold text-brand">
                        {metrics.maintainabilityIndex}/100
                    </span>
                </div>
                <div className="w-full bg-border rounded-full h-3">
                    <div
                        className="h-3 rounded-full bg-gradient-to-r from-brand to-blue-600 transition-all duration-1000"
                        style={{ width: `${metrics.maintainabilityIndex}%` }}
                    />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Cyclomatic Complexity */}
                <div className="bg-surface rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Code2 className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-text-secondary">
                            Complexity
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-text-primary">
                        {metrics.cyclomaticComplexity}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                        {metrics.cyclomaticComplexity > 20 ? 'High' : metrics.cyclomaticComplexity > 10 ? 'Medium' : 'Low'}
                    </div>
                </div>

                {/* Lines of Code */}
                <div className="bg-surface rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Code2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-text-secondary">
                            Lines of Code
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-text-primary">
                        {metrics.linesOfCode.toLocaleString()}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                        Total LOC
                    </div>
                </div>

                {/* Code Smells */}
                <div className="bg-surface rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-text-secondary">
                            Code Smells
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-text-primary">
                        {metrics.codeSmells}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                        Issues detected
                    </div>
                </div>

                {/* Technical Debt */}
                <div className="bg-surface rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-text-secondary">
                            Technical Debt
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-text-primary">
                        {formatTime(metrics.technicalDebtMinutes)}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                        Estimated fix time
                    </div>
                </div>
            </div>

            {/* Halstead Metrics */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-text-secondary">
                    Halstead Metrics
                </h4>
                <div className="space-y-3">
                    <MetricBar
                        value={Math.min(metrics.halsteadMetrics.volume, 10000)}
                        max={10000}
                        label="Volume"
                        color="bg-blue-500"
                    />
                    <MetricBar
                        value={Math.min(metrics.halsteadMetrics.difficulty, 100)}
                        max={100}
                        label="Difficulty"
                        color="bg-yellow-500"
                    />
                    <MetricBar
                        value={Math.min(metrics.halsteadMetrics.effort, 100000)}
                        max={100000}
                        label="Effort"
                        color="bg-purple-500"
                    />
                </div>
            </div>
        </Card>
    );
}
