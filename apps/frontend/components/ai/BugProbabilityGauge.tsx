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
            <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 sm:p-8 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/20 flex-shrink-0 shadow-inner">
                        <Bug className="w-6 h-6 text-brand" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                        Bug Probability
                    </h3>
                </div>
                <div className="relative z-10 text-center py-10">
                    <div className="p-4 rounded-full bg-surface/80 inline-flex mb-4 border border-white/5">
                        <Bug className="w-10 h-10 text-text-secondary/50" />
                    </div>
                    <p className="text-sm font-light text-text-secondary leading-relaxed">
                        No bug probability data available
                    </p>
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
        <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 sm:p-8 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-colors duration-300 space-y-6 sm:space-y-8">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Header */}
            <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-brand/10 border border-brand/20 flex-shrink-0 shadow-inner">
                    <Bug className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                    Bug Probability
                </h3>
            </div>

            {/* Probability Meter */}
            <div className="relative z-10">
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
                <div className="relative z-10 space-y-4">
                    <h4 className="text-sm font-bold tracking-tight text-text-primary uppercase flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand" />
                        Risk Factors
                    </h4>
                    <ul className="space-y-3">
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
                <div className="relative z-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 shadow-inner">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20 flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold tracking-tight text-text-primary mb-1.5">
                                Recommendation
                            </h4>
                            <p className="text-sm font-light text-text-secondary leading-relaxed">
                                {recommendation}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
