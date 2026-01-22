"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAIStore } from '@/store/aiStore';
import {
    AIAnalysisButton,
    AIReviewCard,
    QualityMetricsCard,
    BugProbabilityGauge,
    SecurityAlertsPanel,
    StatCard
} from '@/components/ai';
import { ArrowLeft, GitPullRequest, Loader2, TrendingUp, Code2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/Ui/Card';

export default function PRDetailClient({
    orgId,
    repoId,
    prId
}: {
    orgId: string;
    repoId: string;
    prId: string;
}) {
    const router = useRouter();
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
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-colors mb-2 cursor-pointer"
                >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Back</span>
                    <span className="sm:hidden">Back</span>
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-brand/10 flex-shrink-0">
                            <GitPullRequest className="w-4 h-4 sm:w-6 sm:h-6 text-brand" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-text-primary">
                                AI Code Analysis
                            </h1>
                            <p className="text-xs sm:text-sm text-text-secondary mt-0.5 sm:mt-1">
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

            {/* Empty State - No Analysis Yet */}
            {!loading && !analysis && !showAISection && (
                <Card className="p-8 sm:p-12 border-2 border-dashed border-border/50">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-brand animate-pulse" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2 sm:mb-3">
                            AI Analysis Available
                        </h3>
                        <p className="text-sm sm:text-base text-text-secondary mb-4 sm:mb-6">
                            Click <strong>"Analyze with AI"</strong> to get intelligent insights including:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-left mb-6">
                            <div className="flex items-start gap-2 text-xs sm:text-sm text-text-secondary">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                                <span>Code quality scoring</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs sm:text-sm text-text-secondary">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                                <span>Bug probability prediction</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs sm:text-sm text-text-secondary">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                                <span>Security vulnerability detection</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs sm:text-sm text-text-secondary">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                                <span>Actionable recommendations</span>
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-text-secondary/70">
                            Powered by Gemini AI
                        </p>
                    </div>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <Card className="p-8 sm:p-12">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-brand mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-text-secondary">
                            Analyzing pull request with AI...
                        </p>
                        <p className="text-xs sm:text-sm text-text-secondary/70 mt-1 sm:mt-2">
                            This may take 5-10 seconds
                        </p>
                    </div>
                </Card>
            )}

            {/* AI Analysis Results */}
            {!loading && (analysis || showAISection) && (
                <div className="space-y-6">
                    {/* Stats Overview - Only show if analysis exists */}
                    {analysis && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                            <StatCard
                                title="Overall Score"
                                value={`${analysis.overallScore}/100`}
                                icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                                color={analysis.overallScore >= 70 ? 'text-green-500' : analysis.overallScore >= 50 ? 'text-yellow-500' : 'text-red-500'}
                            />
                            <StatCard
                                title="Code Quality"
                                value={analysis.qualityMetrics?.grade || 'N/A'}
                                icon={<Code2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                                color="text-blue-500"
                            />
                            <StatCard
                                title="Issues Found"
                                value={analysis.aiReview?.issues?.length || 0}
                                icon={<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                                color="text-orange-500"
                            />
                            <StatCard
                                title="Processing Time"
                                value={`${(analysis.processingTimeMs / 1000).toFixed(1)}s`}
                                icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                                color="text-purple-500"
                            />
                        </div>
                    )}

                    {/* AI Review Card */}
                    {analysis?.aiReview && (
                        <AIReviewCard review={analysis.aiReview} />
                    )}

                    {/* Quality Metrics & Bug Probability Grid */}
                    {(analysis?.qualityMetrics || analysis?.bugProbability) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Quality Metrics - Always show if available */}
                            {analysis?.qualityMetrics && (
                                <QualityMetricsCard metrics={analysis.qualityMetrics} />
                            )}

                            {/* Bug Probability - Only show if available */}
                            {analysis?.bugProbability ? (
                                <BugProbabilityGauge bugProbability={analysis.bugProbability} />
                            ) : analysis?.qualityMetrics ? (
                                <Card className="p-6">
                                    <div className="text-center py-8">
                                        <AlertCircle className="w-12 h-12 text-text-secondary/50 mx-auto mb-3" />
                                        <p className="text-text-secondary">
                                            Bug probability analysis not available
                                        </p>
                                        <p className="text-sm text-text-secondary/70 mt-2">
                                            This feature requires additional PR metadata
                                        </p>
                                    </div>
                                </Card>
                            ) : null}
                        </div>
                    )}

                    {/* Security Alerts */}
                    {securityAlerts && securityAlerts.length > 0 && (
                        <SecurityAlertsPanel alerts={securityAlerts} />
                    )}

                    {/* Recommendations Summary */}
                    {analysis?.recommendations && analysis.recommendations.length > 0 && (
                        <Card className="p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-3 sm:mb-4">
                                📋 Action Items
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {analysis.recommendations.map((rec, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2 p-2.5 sm:p-3 bg-brand/5 rounded-lg border border-brand/20 hover:bg-brand/10 transition-colors"
                                    >
                                        <span className="text-brand font-bold flex-shrink-0 text-sm sm:text-base">
                                            {index + 1}.
                                        </span>
                                        <span className="text-text-secondary text-xs sm:text-sm">
                                            {rec}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Processing Time Footer */}
                    {analysis?.processingTimeMs && (
                        <div className="text-center text-sm text-text-secondary/70 py-2">
                            Analysis completed in {(analysis.processingTimeMs / 1000).toFixed(2)}s
                        </div>
                    )}
                </div>
            )
            }

            {/* Empty State */}
            {
                !loading && !analysis && !showAISection && (
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
                )
            }
        </div >
    );
}
