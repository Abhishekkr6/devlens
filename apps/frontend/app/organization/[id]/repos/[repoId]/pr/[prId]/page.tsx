"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAIStore } from '@/store/aiStore';
import {
    AIAnalysisButton,
    AIReviewCard,
    QualityMetricsCard,
    BugProbabilityGauge,
    SecurityAlertsPanel
} from '@/components/ai';
import { ArrowLeft, GitPullRequest, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PRDetailPage() {
    const params = useParams();
    const orgId = params.id as string;
    const repoId = params.repoId as string;
    const prId = params.prId as string;

    const { analysis, insights, securityAlerts, loading, fetchInsights, fetchSecurityAlerts, checkAIStatus } = useAIStore();
    const [showAISection, setShowAISection] = useState(false);

    useEffect(() => {
        // Check AI status on mount
        checkAIStatus();

        // Fetch existing insights if available
        if (prId) {
            fetchInsights(prId);
            if (repoId) {
                fetchSecurityAlerts(repoId, 'open');
            }
        }
    }, [prId, repoId]);

    const handleAnalysisComplete = () => {
        setShowAISection(true);
        // Refresh insights after analysis
        if (prId) {
            fetchInsights(prId);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/organization/${orgId}/repos/${repoId}`}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Repository
                    </Link>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <GitPullRequest className="w-8 h-8 text-purple-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Pull Request Analysis
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    AI-powered code review and quality metrics
                                </p>
                            </div>
                        </div>

                        <AIAnalysisButton
                            orgId={orgId}
                            repoId={repoId}
                            prId={prId}
                            onAnalysisComplete={handleAnalysisComplete}
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">
                                Analyzing pull request with AI...
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                This may take 5-10 seconds
                            </p>
                        </div>
                    </div>
                )}

                {/* AI Analysis Results */}
                {!loading && (analysis || showAISection) && (
                    <div className="space-y-6">
                        {/* AI Review Card */}
                        {analysis?.aiReview && (
                            <AIReviewCard review={analysis.aiReview} />
                        )}

                        {/* Quality Metrics & Bug Probability Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {analysis?.qualityMetrics && (
                                <QualityMetricsCard metrics={analysis.qualityMetrics} />
                            )}

                            {analysis?.bugProbability && (
                                <BugProbabilityGauge bugProbability={analysis.bugProbability} />
                            )}
                        </div>

                        {/* Security Alerts */}
                        {securityAlerts && securityAlerts.length > 0 && (
                            <SecurityAlertsPanel alerts={securityAlerts} />
                        )}

                        {/* Recommendations Summary */}
                        {analysis?.recommendations && analysis.recommendations.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                    📋 Action Items
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {analysis.recommendations.map((rec, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                                        >
                                            <span className="text-purple-600 dark:text-purple-400 font-bold">
                                                {index + 1}.
                                            </span>
                                            <span className="text-gray-700 dark:text-gray-300">
                                                {rec}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Processing Time */}
                        {analysis?.processingTimeMs && (
                            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                                Analysis completed in {(analysis.processingTimeMs / 1000).toFixed(2)}s
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !analysis && !showAISection && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <GitPullRequest className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No Analysis Yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Click "Analyze with AI" to get intelligent code review suggestions, quality metrics, and security insights for this pull request.
                            </p>
                            <AIAnalysisButton
                                orgId={orgId}
                                repoId={repoId}
                                prId={prId}
                                onAnalysisComplete={handleAnalysisComplete}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
