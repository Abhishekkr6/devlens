import { Request, Response } from 'express';
import { getCodeAnalysisService } from '../services/ai/codeAnalysis.service';
import { getQualityMetricsService } from '../services/ai/qualityMetrics.service';
import { AIInsight } from '../models/aiInsight.model';
import { CodeQualityMetric } from '../models/codeQualityMetric.model';
import { SecurityAlert } from '../models/securityAlert.model';
import { PRModel } from '../models/pr.model';
import { RepoModel } from '../models/repo.model';
import { UserModel } from '../models/user.model';
import logger from '../utils/logger';

/**
 * Analyze a Pull Request with AI
 * POST /api/v1/ai/analyze-pr
 */
export const analyzePR = async (req: Request, res: Response) => {
    try {
        const { orgId, repoId, prId } = req.body;
        const userId = (req as any).user?.id;

        if (!orgId || !repoId || !prId) {
            return res.status(400).json({
                success: false,
                error: { message: 'orgId, repoId, and prId are required' }
            });
        }

        // Fetch PR details
        const pr = await PRModel.findById(prId).populate('repoId');
        if (!pr) {
            return res.status(404).json({
                success: false,
                error: { message: 'Pull request not found' }
            });
        }

        // Fetch repo to get GitHub token
        const repo = await RepoModel.findById(repoId);
        if (!repo) {
            return res.status(404).json({
                success: false,
                error: { message: 'Repository not found' }
            });
        }

        // Get user's GitHub token
        const user = await UserModel.findById(userId);
        if (!user?.githubAccessToken) {
            return res.status(401).json({
                success: false,
                error: { message: 'GitHub access token not found' }
            });
        }

        logger.info({ prId, repoId, orgId }, 'Starting AI analysis for PR');

        const startTime = Date.now();

        // Run AI analysis with caching
        const codeAnalysisService = getCodeAnalysisService();
        const analysisResult = await codeAnalysisService.analyzePR(
            {
                repoFullName: repo.repoFullName,
                prNumber: pr.number || 0,
                prTitle: pr.title || '',
                prDescription: '', // PR model doesn't have body field
                additions: pr.additions || 0,
                deletions: pr.deletions || 0,
                filesChanged: pr.filesChanged || 0,
                authorCommits: 0 // TODO: Calculate from commit history
            },
            user.githubAccessToken,
            prId // Pass prId for caching
        );

        const processingTime = Date.now() - startTime;

        // Save AI Review Insight
        if (analysisResult.aiReview) {
            const aiInsight = new AIInsight({
                orgId,
                repoId,
                prId,
                type: 'code_review',
                provider: 'gemini',
                score: analysisResult.aiReview.score,
                severity: analysisResult.aiReview.score >= 70 ? 'low' :
                    analysisResult.aiReview.score >= 50 ? 'medium' : 'high',
                issues: analysisResult.aiReview.issues || [],
                summary: analysisResult.aiReview.summary,
                recommendations: analysisResult.aiReview.recommendations || [],
                analyzedAt: new Date(),
                processingTimeMs: processingTime,
                cached: false,
                rawData: analysisResult.aiReview
            });

            await aiInsight.save();
        }

        // Save Quality Metrics
        if (analysisResult.qualityMetrics) {
            const qualityService = getQualityMetricsService();
            const grade = qualityService.getQualityGrade(
                analysisResult.qualityMetrics.maintainabilityIndex
            );

            const qualityMetric = new CodeQualityMetric({
                orgId,
                repoId,
                prId,
                maintainabilityIndex: analysisResult.qualityMetrics.maintainabilityIndex,
                cyclomaticComplexity: analysisResult.qualityMetrics.cyclomaticComplexity,
                linesOfCode: analysisResult.qualityMetrics.linesOfCode,
                codeSmells: analysisResult.qualityMetrics.codeSmells,
                technicalDebtMinutes: analysisResult.qualityMetrics.technicalDebtMinutes,
                halsteadVolume: analysisResult.qualityMetrics.halsteadMetrics.volume,
                halsteadDifficulty: analysisResult.qualityMetrics.halsteadMetrics.difficulty,
                halsteadEffort: analysisResult.qualityMetrics.halsteadMetrics.effort,
                grade,
                calculatedAt: new Date(),
                filesAnalyzed: pr.filesChanged
            });

            await qualityMetric.save();
        }

        // Save Bug Probability Prediction
        if (analysisResult.bugProbability) {
            const predictionInsight = new AIInsight({
                orgId,
                repoId,
                prId,
                type: 'prediction',
                provider: 'gemini',
                score: 100 - analysisResult.bugProbability.probability,
                severity: analysisResult.bugProbability.riskLevel || 'medium',
                issues: [],
                summary: `Bug probability: ${analysisResult.bugProbability.probability}%`,
                recommendations: analysisResult.bugProbability.factors || [],
                analyzedAt: new Date(),
                processingTimeMs: processingTime,
                cached: false,
                rawData: analysisResult.bugProbability
            });

            await predictionInsight.save();
        }

        logger.info({
            prId,
            overallScore: analysisResult.overallScore,
            processingTime
        }, 'AI analysis completed');

        res.json({
            success: true,
            data: {
                overallScore: analysisResult.overallScore,
                aiReview: analysisResult.aiReview,
                qualityMetrics: analysisResult.qualityMetrics,
                bugProbability: analysisResult.bugProbability,
                recommendations: analysisResult.recommendations,
                processingTimeMs: processingTime
            }
        });
    } catch (error: any) {
        logger.error('AI analysis error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: error.message || 'AI analysis failed',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        });
    }
};

/**
 * Get AI insights for a PR
 * GET /api/v1/ai/insights/:prId
 */
export const getPRInsights = async (req: Request, res: Response) => {
    try {
        const { prId } = req.params;

        // Fetch all insights for this PR
        const insights = await AIInsight.find({ prId }).sort({ analyzedAt: -1 });
        const qualityMetrics = await CodeQualityMetric.findOne({ prId }).sort({ calculatedAt: -1 });
        const securityAlerts = await SecurityAlert.find({ prId, status: 'open' });

        res.json({
            success: true,
            data: {
                insights,
                qualityMetrics,
                securityAlerts,
                summary: {
                    totalInsights: insights.length,
                    criticalIssues: insights.filter(i => i.severity === 'critical').length,
                    highIssues: insights.filter(i => i.severity === 'high').length,
                    securityAlertsCount: securityAlerts.length
                }
            }
        });
    } catch (error: any) {
        logger.error('Get PR insights error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch PR insights' }
        });
    }
};

/**
 * Get repository quality metrics
 * GET /api/v1/ai/quality/:repoId
 */
export const getRepoQuality = async (req: Request, res: Response) => {
    try {
        const { repoId } = req.params;
        const { limit = 10 } = req.query;

        // Fetch recent quality metrics
        const metrics = await CodeQualityMetric.find({ repoId })
            .sort({ calculatedAt: -1 })
            .limit(Number(limit));

        if (metrics.length === 0) {
            return res.json({
                success: true,
                data: {
                    current: null,
                    history: [],
                    trend: 'stable'
                }
            });
        }

        const current = metrics[0];
        const previous = metrics[1];

        // Calculate trend
        const qualityService = getQualityMetricsService();
        const trend = previous
            ? qualityService.calculateTrend(
                current.maintainabilityIndex,
                previous.maintainabilityIndex
            )
            : 'stable';

        res.json({
            success: true,
            data: {
                current,
                history: metrics,
                trend,
                averageScore: metrics.reduce((sum, m) => sum + m.maintainabilityIndex, 0) / metrics.length
            }
        });
    } catch (error: any) {
        logger.error('Get repo quality error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch repository quality metrics' }
        });
    }
};

/**
 * Get security alerts for a repository
 * GET /api/v1/ai/security/:repoId
 */
export const getSecurityAlerts = async (req: Request, res: Response) => {
    try {
        const { repoId } = req.params;
        const { status = 'open' } = req.query;

        const alerts = await SecurityAlert.find({
            repoId,
            status: status as string
        }).sort({ detectedAt: -1 });

        const summary = {
            total: alerts.length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            high: alerts.filter(a => a.severity === 'high').length,
            medium: alerts.filter(a => a.severity === 'medium').length,
            low: alerts.filter(a => a.severity === 'low').length
        };

        res.json({
            success: true,
            data: {
                alerts,
                summary
            }
        });
    } catch (error: any) {
        logger.error('Get security alerts error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch security alerts' }
        });
    }
};

/**
 * Resolve a security alert
 * POST /api/v1/ai/security/:alertId/resolve
 */
export const resolveSecurityAlert = async (req: Request, res: Response) => {
    try {
        const { alertId } = req.params;
        const { status, resolutionNote } = req.body;
        const userId = (req as any).user?.id;

        if (!['resolved', 'ignored', 'false-positive'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Invalid status. Must be: resolved, ignored, or false-positive' }
            });
        }

        const alert = await SecurityAlert.findByIdAndUpdate(
            alertId,
            {
                status,
                resolvedAt: new Date(),
                resolvedBy: userId,
                resolutionNote
            },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                error: { message: 'Security alert not found' }
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error: any) {
        logger.error('Resolve security alert error:', error);
        res.status(500).json({
            success: false,
            error: { message: 'Failed to resolve security alert' }
        });
    }
};

/**
 * Check if AI features are available
 * GET /api/v1/ai/status
 */
export const getAIStatus = async (req: Request, res: Response) => {
    try {
        const codeAnalysisService = getCodeAnalysisService();
        const isAvailable = codeAnalysisService.isAIAvailable();

        res.json({
            success: true,
            data: {
                aiAvailable: isAvailable,
                provider: isAvailable ? 'gemini' : 'none',
                features: {
                    codeReview: isAvailable,
                    qualityMetrics: true,
                    securityScan: isAvailable,
                    bugPrediction: isAvailable
                }
            }
        });
    } catch (error: any) {
        res.json({
            success: true,
            data: {
                aiAvailable: false,
                provider: 'none',
                features: {
                    codeReview: false,
                    qualityMetrics: true,
                    securityScan: false,
                    bugPrediction: false
                }
            }
        });
    }
};
