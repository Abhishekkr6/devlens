"use client";

import { BugProbability } from '@/lib/aiAPI';
import { Bug, TrendingUp, AlertTriangle } from 'lucide-react';

interface BugProbabilityGaugeProps {
    bugProbability: BugProbability | null;
}

export function BugProbabilityGauge({ bugProbability }: BugProbabilityGaugeProps) {
    if (!bugProbability) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Bug className="w-6 h-6 text-purple-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Bug Probability
                    </h3>
                </div>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No bug probability data available
                </div>
            </div>
        );
    }

    const { probability, riskLevel, factors, recommendation } = bugProbability;

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'high': return 'text-orange-500';
            case 'critical': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getRiskBg = (level: string) => {
        switch (level) {
            case 'low': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'high': return 'bg-orange-500';
            case 'critical': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Bug className="w-6 h-6 text-purple-500" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Bug Probability
                </h3>
            </div>

            {/* Probability Meter */}
            <div className="relative">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Risk Level
                    </span>
                    <span className={`text-sm font-bold uppercase ${getRiskColor(riskLevel)}`}>
                        {riskLevel}
                    </span>
                </div>

                <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
                <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Risk Factors
                    </h4>
                    <ul className="space-y-2">
                        {factors.map((factor, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
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
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                Recommendation
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                {recommendation}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
