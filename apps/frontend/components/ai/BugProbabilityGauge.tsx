"use client";

import { BugProbability } from '@/lib/aiAPI';
import { Bug, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/Ui/Card';

interface BugProbabilityGaugeProps {
    bugProbability: BugProbability | null;
}

export function BugProbabilityGauge({ bugProbability }: BugProbabilityGaugeProps) {
    if (!bugProbability) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Bug className="w-6 h-6 text-brand" />
                    <h3 className="text-xl font-semibold text-text-primary">
                        Bug Probability
                    </h3>
                </div>
                <div className="text-center py-8 text-text-secondary">
                    No bug probability data available
                </div>
            </Card>
        );
    }

    const { probability, riskLevel, factors, recommendation } = bugProbability;

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'high': return 'text-orange-500';
            case 'critical': return 'text-red-500';
            default: return 'text-text-secondary';
        }
    };

    const getRiskBg = (level: string) => {
        switch (level) {
            case 'low': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'high': return 'bg-orange-500';
            case 'critical': return 'bg-red-500';
            default: return 'bg-border';
        }
    };

    return (
        <Card className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Bug className="w-6 h-6 text-brand" />
                <h3 className="text-xl font-semibold text-text-primary">
                    Bug Probability
                </h3>
            </div>

            {/* Probability Meter */}
            <div className="relative">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary">
                        Risk Level
                    </span>
                    <span className={`text-sm font-bold uppercase ${getRiskColor(riskLevel)}`}>
                        {riskLevel}
                    </span>
                </div>

                <div className="relative h-8 bg-border rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getRiskBg(riskLevel)} transition-all duration-1000 flex items-center justify-end pr-3`}
                        style={{ width: `${probability}%` }}
                    >
                        <span className="text-white font-bold text-sm">
                            {probability}%
                        </span>
                    </div>
                </div>

                {/* Scale markers */}
                <div className="flex justify-between mt-1 text-xs text-text-secondary">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Risk Factors */}
            {factors && factors.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Risk Factors
                    </h4>
                    <ul className="space-y-2">
                        {factors.map((factor, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-text-secondary"
                            >
                                <span className="text-orange-500 mt-1">•</span>
                                <span>{factor}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommendation */}
            {recommendation && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-text-primary mb-1">
                                Recommendation
                            </h4>
                            <p className="text-sm text-text-secondary">
                                {recommendation}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
