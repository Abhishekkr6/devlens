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
import { Card } from '@/components/Ui/Card';

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
        <div className="flex h-full flex-col gap-6">
            {/* Header */}
            <header className="space-y-2">
                <Link
                    href={`/organization/${orgId}/repos/${repoId}`}
                    className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Repository
                </Link>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-brand/10">
                            <GitPullRequest className="w-6 h-6 text-brand" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-text-primary">
                                AI Code Analysis
                            </h1>
                            <p className="text-sm text-text-secondary mt-1">
                                Intelligent code review, quality metrics, and security insights
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
            </header>

            {/* Loading State */}
            {loading && (
                <Card className="p-12">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-brand mx-auto mb-4" />
                        <p className="text-text-secondary">
                            Analyzing pull request with AI...
                        </p>
                        <p className="text-sm text-text-secondary/70 mt-2">
                            This may take 5-10 seconds
                        </p>
                    </div>
                </Card>
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
                        <Card className="p-6">
                            <h3 className="text-xl font-semibold text-text-primary mb-4">
                                📋 Action Items
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {analysis.recommendations.map((rec, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2 p-3 bg-brand/5 rounded-lg border border-brand/20"
                                    >
                                        <span className="text-brand font-bold">
                                            {index + 1}.
                                        </span>
                                        <span className="text-text-secondary text-sm">
                                            {rec}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Processing Time */}
                    {analysis?.processingTimeMs && (
                        <div className="text-center text-sm text-text-secondary">
                            Analysis completed in {(analysis.processingTimeMs / 1000).toFixed(2)}s
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!loading && !analysis && !showAISection && (
                <Card className="p-12">
                    <div className="max-w-md mx-auto text-center">
                        <div className="p-4 rounded-full bg-surface inline-flex mb-4">
                            <GitPullRequest className="w-12 h-12 text-text-secondary" />
                        </div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">
                            No Analysis Yet
                        </h3>
                        <p className="text-text-secondary mb-6">
                            Click "Analyze with AI" to get intelligent code review suggestions, quality metrics, and security insights for this pull request.
                        </p>
                        <AIAnalysisButton
                            orgId={orgId}
                            repoId={repoId}
                            prId={prId}
                            onAnalysisComplete={handleAnalysisComplete}
                        />
                    </div>
                </Card>
            )}
        </div>
    );
}
