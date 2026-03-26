"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAIStore } from '@/store/aiStore';
import {
    Sparkles,
    TrendingUp,
    Shield,
    Bug,
    Code2,
    AlertTriangle,
    CheckCircle2,
    Clock
} from 'lucide-react';


export default function AIDashboardPage() {
    const params = useParams();
    params.id; // used for route context

    const { securityAlerts, aiStatus, checkAIStatus } = useAIStore();

    useEffect(() => {
        checkAIStatus();
    }, []);

    // Mock data for demonstration - replace with actual API calls
    const repoQualityData = [
        { name: 'frontend', grade: 'B', score: 78, smells: 12, debt: '4h' },
        { name: 'backend', grade: 'A', score: 92, smells: 3, debt: '1h' },
        { name: 'mobile-app', grade: 'C', score: 65, smells: 28, debt: '8h' }
    ];

    const recentAnalyses = [
        { prTitle: 'Add user authentication', repo: 'backend', score: 88, time: '2 hours ago' },
        { prTitle: 'Fix responsive layout', repo: 'frontend', score: 75, time: '5 hours ago' },
        { prTitle: 'Update dependencies', repo: 'backend', score: 92, time: '1 day ago' }
    ];

    const getGradeColor = (grade: string) => {
        const colors = {
            'A': 'text-green-500 bg-green-500/10',
            'B': 'text-lime-500 bg-lime-500/10',
            'C': 'text-yellow-500 bg-yellow-500/10',
            'D': 'text-orange-500 bg-orange-500/10',
            'F': 'text-red-500 bg-red-500/10'
        };
        return colors[grade as keyof typeof colors] || colors.F;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            AI Insights Dashboard
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Overview of code quality, security, and AI-powered insights across your repositories
                    </p>
                </div>

                {/* AI Status Banner */}
                {aiStatus && (
                    <div className={`mb-6 p-4 rounded-lg border ${aiStatus.aiAvailable
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                        <div className="flex items-center gap-3">
                            {aiStatus.aiAvailable ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            )}
                            <div>
                                <p className={`font-medium ${aiStatus.aiAvailable
                                        ? 'text-green-900 dark:text-green-100'
                                        : 'text-red-900 dark:text-red-100'
                                    }`}>
                                    AI Services {aiStatus.aiAvailable ? 'Online' : 'Offline'}
                                </p>
                                <p className={`text-sm ${aiStatus.aiAvailable
                                        ? 'text-green-700 dark:text-green-300'
                                        : 'text-red-700 dark:text-red-300'
                                    }`}>
                                    Provider: {aiStatus.provider} • Features: {Object.values(aiStatus.features).filter(Boolean).length}/4 active
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Repositories */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Code2 className="w-8 h-8 text-blue-500" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {repoQualityData.length}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Repositories Analyzed
                        </p>
                    </div>

                    {/* Security Alerts */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Shield className="w-8 h-8 text-red-500" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {securityAlerts?.filter(a => a.status === 'open').length || 0}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Open Security Alerts
                        </p>
                    </div>

                    {/* Code Smells */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Bug className="w-8 h-8 text-orange-500" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {repoQualityData.reduce((sum, r) => sum + r.smells, 0)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Code Smells
                        </p>
                    </div>

                    {/* Technical Debt */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="w-8 h-8 text-purple-500" />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                13h
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Technical Debt
                        </p>
                    </div>
                </div>

                {/* Repository Quality Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Repository Quality Overview
                    </h3>
                    <div className="space-y-4">
                        {repoQualityData.map((repo) => (
                            <div
                                key={repo.name}
                                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${getGradeColor(repo.grade)}`}>
                                    {repo.grade}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {repo.name}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        <span>Score: {repo.score}/100</span>
                                        <span>•</span>
                                        <span>{repo.smells} code smells</span>
                                        <span>•</span>
                                        <span>{repo.debt} tech debt</span>
                                    </div>
                                </div>
                                <div className="w-32">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600"
                                            style={{ width: `${repo.score}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Analyses */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Recent AI Analyses
                    </h3>
                    <div className="space-y-3">
                        {recentAnalyses.map((analysis, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {analysis.prTitle}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {analysis.repo} • {analysis.time}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            {analysis.score}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Score
                                        </div>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
