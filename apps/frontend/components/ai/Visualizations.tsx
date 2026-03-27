"use client";

import { Card } from '@/components/Ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreTrendProps {
    current: number;
    previous?: number;
    label: string;
}

export function ScoreTrend({ current, previous, label }: ScoreTrendProps) {
    if (!previous) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-text-primary">{current}</span>
                <span className="text-sm text-text-secondary">{label}</span>
            </div>
        );
    }

    const diff = current - previous;
    const percentChange = previous > 0 ? ((diff / previous) * 100).toFixed(1) : 0;

    const getTrendColor = () => {
        if (diff > 0) return 'text-green-500';
        if (diff < 0) return 'text-red-500';
        return 'text-text-secondary';
    };

    const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;

    return (
        <div className="flex items-center gap-3">
            <div>
                <div className="text-2xl font-bold text-text-primary">{current}</div>
                <div className="text-sm text-text-secondary">{label}</div>
            </div>
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                    {Math.abs(Number(percentChange))}%
                </span>
            </div>
        </div>
    );
}

interface ProgressRingProps {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
}

export function ProgressRing({
    value,
    max,
    size = 120,
    strokeWidth = 8,
    color = 'text-brand',
    label
}: ProgressRingProps) {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-border"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={`${color} transition-all duration-1000`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${color}`}>
                    {value}
                </span>
                {label && (
                    <span className="text-xs text-text-secondary mt-1">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: string;
}

export function StatCard({ title, value, icon, trend, color = 'text-brand' }: StatCardProps) {
    return (
        <Card className="rounded-2xl border border-white/10 bg-surface/50 backdrop-blur-xl p-4 sm:p-5 md:p-6 shadow-lg hover:border-brand/30 hover:shadow-[0_0_20px_rgba(74,93,255,0.1)] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-text-secondary mb-1 sm:mb-2 truncate">{title}</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight truncate">{value}</p>
                    {trend && (
                        <div className={`inline-flex items-center gap-1.5 mt-3 sm:mt-4 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-bold shadow-sm border ${trend.isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            {trend.isPositive ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                                <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-surface border border-white/5 shadow-inner ${color} flex-shrink-0`}>
                    {icon}
                </div>
            </div>
        </Card>
    );
}

interface ProgressBarProps {
    label: string;
    value: number;
    max: number;
    color?: string;
    showPercentage?: boolean;
}

export function ProgressBar({
    label,
    value,
    max,
    color = 'bg-brand',
    showPercentage = true
}: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-text-secondary">{label}</span>
                <span className="font-medium text-text-primary">
                    {showPercentage ? `${percentage.toFixed(0)}%` : value}
                </span>
            </div>
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-1000 rounded-full`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
