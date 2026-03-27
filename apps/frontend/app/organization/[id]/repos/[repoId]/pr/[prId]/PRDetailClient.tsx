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
import { motion } from 'motion/react';
import { ArrowLeft, GitPullRequest, Loader2, TrendingUp, Code2, AlertCircle, Clock, Sparkles } from 'lucide-react';

import { Card } from '@/components/Ui/Card';
import { showAIAnalysisToast } from '@/lib/aiToast';

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
    const { analysis, securityAlerts, loading, fetchInsights, fetchSecurityAlerts, checkAIStatus } = useAIStore();
    const [showAISection, setShowAISection] = useState(false);

    useEffect(() => {
        checkAIStatus();

        if (prId) {
            fetchInsights(prId);
            if (repoId) {
                fetchSecurityAlerts(repoId, 'open');
            }
        }
    }, [prId, repoId]);

    const handleAnalysisComplete = () => {
        setShowAISection(true);
        if (prId) {
            fetchInsights(prId);

            if (analysis) {
                const score = analysis.overallScore || 0;
                const issuesCount = (analysis as any).issues?.length || 0;
                showAIAnalysisToast(prId, score, issuesCount);
            }
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="flex h-full flex-col gap-6"
        >
            <header className="space-y-4">
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
                        <div className="p-2 sm:p-2.5 rounded-xl bg-brand/10 border border-brand/20 flex-shrink-0 shadow-inner">
                            <GitPullRequest className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
                        </div>
                        <div>
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary"
                            >
                                AI Code Analysis
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-xs sm:text-sm text-text-secondary mt-0.5 sm:mt-1 font-light"
                            >
                                Intelligent code review, quality metrics, and security insights
                            </motion.p>
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

            {!loading && !analysis && !showAISection && (
                <Card className="rounded-3xl border border-brand/20 bg-surface/50 backdrop-blur-xl p-8 sm:p-12 shadow-lg relative overflow-hidden group hover:border-brand/40 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative z-10 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-[0_0_20px_rgba(74,93,255,0.15)]">
                            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-brand animate-pulse" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mb-2 sm:mb-3">
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
                        <p className="text-[10px] text-text-secondary/50 mt-2">
                            Powered by Gemini AI
                        </p>
                    </div>
                </Card>
            )}

            {loading && (
                <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
                    <div className="relative z-10 text-center">
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

            {!loading && (analysis || showAISection) && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                    className="space-y-6"
                >
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

                    {analysis?.aiReview && (
                        <AIReviewCard review={analysis.aiReview} />
                    )}

                    {(analysis?.qualityMetrics || analysis?.bugProbability) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {analysis?.qualityMetrics && (
                                <QualityMetricsCard metrics={analysis.qualityMetrics} />
                            )}

                            {analysis?.bugProbability ? (
                                <BugProbabilityGauge bugProbability={analysis.bugProbability} />
                            ) : analysis?.qualityMetrics ? (
                                <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 shadow-lg relative overflow-hidden">
                                    <div className="relative z-10 text-center py-8">
                                        <div className="p-4 rounded-full bg-surface/80 inline-flex mb-4 border border-white/5">
                                            <AlertCircle className="w-10 h-10 text-text-secondary/50" />
                                        </div>
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

                    {securityAlerts && securityAlerts.length > 0 && (
                        <SecurityAlertsPanel alerts={securityAlerts} />
                    )}

                    {analysis?.recommendations && analysis.recommendations.length > 0 && (
                        <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-4 sm:p-6 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-colors duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative z-10">
                                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-text-primary mb-3 sm:mb-4">
                                    📋 Action Items
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {analysis.recommendations.map((rec, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 p-3 sm:p-4 bg-surface/40 rounded-2xl border border-white/5 hover:bg-surface/80 hover:border-white/10 transition-colors shadow-sm"
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
                            </div>
                        </Card>
                    )}

                    {analysis?.processingTimeMs && (
                        <div className="text-center text-sm text-text-secondary/70 py-2">
                            Analysis completed in {(analysis.processingTimeMs / 1000).toFixed(2)}s
                        </div>
                    )}
                </motion.div>
            )
            }

            {
                !loading && !analysis && !showAISection && (
                    <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-12 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="relative z-10 max-w-md mx-auto text-center">
                            <div className="p-4 rounded-full bg-surface/80 inline-flex mb-4 shadow-sm border border-white/5">
                                <GitPullRequest className="w-10 h-10 text-text-secondary" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-text-primary mb-2">
                                No Analysis Yet
                            </h3>
                            <p className="text-sm font-light text-text-secondary mb-6 leading-relaxed">
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
        </motion.div >
    );
}
