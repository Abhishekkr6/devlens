import { getGeminiService } from './gemini.service';
import { getQualityMetricsService } from './qualityMetrics.service';
import logger from '../../utils/logger';
import axios from 'axios';
import { AnalysisCacheModel } from '../../models/analysisCache.model';
import mongoose from 'mongoose';

interface CodeAnalysisResult {
    score: number;
    issues: Array<{
        file: string;
        line: number;
        severity: 'low' | 'medium' | 'high' | 'critical';
        category: 'bug' | 'security' | 'style' | 'performance' | 'best-practice';
        message: string;
        suggestion: string;
    }>;
    summary: string;
    recommendations: string[];
}

interface PRAnalysisRequest {
    repoFullName: string;
    prNumber: number;
    prTitle: string;
    prDescription: string;
    additions: number;
    deletions: number;
    filesChanged: number;
    authorCommits?: number;
}

interface PRAnalysisResult {
    aiReview: any;
    qualityMetrics: any;
    bugProbability: any;
    overallScore: number;
    recommendations: string[];
}

export class CodeAnalysisService {
    private geminiService: any;
    private qualityService: any;
    private readonly CACHE_DURATION_DAYS = 7; // Cache for 7 days

    constructor() {
        try {
            this.geminiService = getGeminiService();
        } catch (error) {
            logger.warn({ error }, 'Gemini service not available');
            this.geminiService = null;
        }
        this.qualityService = getQualityMetricsService();
    }

    /**
     * Get cached analysis if available and valid
     */
    private async getCachedAnalysis(
        prId: string,
        commitSHA: string
    ): Promise<PRAnalysisResult | null> {
        try {
            const cached = await AnalysisCacheModel.findOne({
                prId: new mongoose.Types.ObjectId(prId),
                commitSHA,
                expiresAt: { $gt: new Date() }
            });

            if (cached) {
                logger.info({ prId, commitSHA }, 'Returning cached analysis');
                return cached.analysis as PRAnalysisResult;
            }

            return null;
        } catch (error) {
            logger.error({ error, prId }, 'Error fetching cached analysis');
            return null;
        }
    }

    /**
     * Save analysis to cache
     */
    private async saveToCache(
        prId: string,
        commitSHA: string,
        analysis: PRAnalysisResult,
        processingTimeMs: number
    ): Promise<void> {
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + this.CACHE_DURATION_DAYS);

            await AnalysisCacheModel.findOneAndUpdate(
                {
                    prId: new mongoose.Types.ObjectId(prId),
                    commitSHA
                },
                {
                    prId: new mongoose.Types.ObjectId(prId),
                    commitSHA,
                    analysis: {
                        ...analysis,
                        processingTimeMs
                    },
                    createdAt: new Date(),
                    expiresAt
                },
                { upsert: true, new: true }
            );

            logger.info({ prId, commitSHA, expiresAt }, 'Analysis cached successfully');
        } catch (error) {
            logger.error({ error, prId }, 'Error saving analysis to cache');
        }
    }

    /**
     * Get latest commit SHA from GitHub
     */
    private async getLatestCommitSHA(
        repoFullName: string,
        prNumber: number,
        githubToken: string
    ): Promise<string> {
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`,
                {
                    headers: {
                        Authorization: `Bearer ${githubToken}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                }
            );

            return response.data.head.sha;
        } catch (error) {
            logger.error({ error, repoFullName, prNumber }, 'Error fetching commit SHA');
            throw error;
        }
    }

    /**
     * Analyze a Pull Request comprehensively with smart caching
     */
    async analyzePR(
        request: PRAnalysisRequest,
        githubToken: string,
        prId?: string
    ): Promise<PRAnalysisResult> {
        const startTime = Date.now();

        try {
            logger.info({
                repo: request.repoFullName,
                pr: request.prNumber,
                prId
            }, 'Starting PR analysis');

            // 1. Get latest commit SHA
            const commitSHA = await this.getLatestCommitSHA(
                request.repoFullName,
                request.prNumber,
                githubToken
            );

            // 2. Check cache if prId is provided
            if (prId) {
                const cached = await this.getCachedAnalysis(prId, commitSHA);
                if (cached) {
                    logger.info({ prId, commitSHA }, 'Cache hit - returning cached analysis');
                    return {
                        ...cached,
                        processingTimeMs: Date.now() - startTime,
                        fromCache: true
                    } as any;
                }
                logger.info({ prId, commitSHA }, 'Cache miss - performing fresh analysis');
            }

            // 3. Fetch PR diff from GitHub
            const diff = await this.fetchPRDiff(
                request.repoFullName,
                request.prNumber,
                githubToken
            );

            // 2. Fetch PR files for quality analysis
            const files = await this.fetchPRFiles(
                request.repoFullName,
                request.prNumber,
                githubToken
            );

            // 3. AI Code Review (if available)
            let aiReview: any = null;
            if (this.geminiService) {
                try {
                    const fileExtensions = files.map(f => {
                        const ext = f.path.split('.').pop();
                        return ext || 'unknown';
                    });

                    aiReview = await this.geminiService.analyzeCodeDiff(
                        diff,
                        request.prTitle,
                        request.prDescription,
                        fileExtensions
                    );
                } catch (error: any) {
                    logger.error({ error }, 'AI review failed');
                    aiReview = {
                        score: 70,
                        issues: [],
                        summary: `AI review unavailable: ${error.message}`,
                        recommendations: []
                    };
                }
            }

            // 4. Code Quality Metrics
            const qualityMetrics = await this.qualityService.analyzeCodeQuality(
                files.map(f => ({
                    path: f.path,
                    content: f.content,
                    language: this.detectLanguage(f.path)
                }))
            );

            // 5. Bug Probability Prediction
            let bugProbability: { probability: number } | null = null;
            if (this.geminiService) {
                try {
                    bugProbability = await this.geminiService.predictBugProbability(
                        request.additions,
                        request.deletions,
                        request.filesChanged,
                        qualityMetrics.cyclomaticComplexity,
                        request.authorCommits || 0
                    );
                } catch (error) {
                    logger.error({ error }, 'Bug prediction failed');
                }
            }

            // 6. Calculate overall score
            const overallScore = this.calculateOverallScore(
                aiReview?.score || 70,
                qualityMetrics.maintainabilityIndex,
                bugProbability?.probability || 30
            );

            // 7. Generate recommendations
            const recommendations = this.generateRecommendations(
                aiReview,
                qualityMetrics,
                bugProbability
            );

            const processingTimeMs = Date.now() - startTime;

            logger.info({
                overallScore,
                issuesFound: aiReview?.issues?.length || 0,
                processingTimeMs,
                commitSHA
            }, 'PR analysis completed');

            const result: PRAnalysisResult = {
                aiReview,
                qualityMetrics,
                bugProbability,
                overallScore,
                recommendations
            };

            // 8. Save to cache if prId is provided
            if (prId) {
                await this.saveToCache(prId, commitSHA, result, processingTimeMs);
            }

            return {
                ...result,
                processingTimeMs
            } as any;
        } catch (error: any) {
            logger.error({ error }, 'PR analysis failed');
            throw new Error(`PR analysis failed: ${error.message}`);
        }
    }

    /**
     * Fetch PR diff from GitHub
     */
    private async fetchPRDiff(
        repoFullName: string,
        prNumber: number,
        githubToken: string
    ): Promise<string> {
        try {
            const response = await axios.get(
                `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`,
                {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3.diff'
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            logger.error({ error }, 'Failed to fetch PR diff');
            throw new Error('Failed to fetch PR diff from GitHub');
        }
    }

    /**
     * Fetch PR files content from GitHub
     */
    private async fetchPRFiles(
        repoFullName: string,
        prNumber: number,
        githubToken: string
    ): Promise<Array<{ path: string; content: string }>> {
        try {
            // Get list of files in PR
            const filesResponse = await axios.get(
                `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}/files`,
                {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            const files = filesResponse.data;
            const fileContents: Array<{ path: string; content: string }> = [];

            // Fetch content for each file (limit to first 10 files to avoid rate limits)
            const filesToAnalyze = files.slice(0, 10);

            for (const file of filesToAnalyze) {
                // Skip deleted files and binary files
                if (file.status === 'removed' || this.isBinaryFile(file.filename)) {
                    continue;
                }

                try {
                    // Use the patch content if available (shows only changes)
                    if (file.patch) {
                        fileContents.push({
                            path: file.filename,
                            content: file.patch
                        });
                    } else {
                        // Fetch full file content
                        const contentResponse = await axios.get(
                            `https://api.github.com/repos/${repoFullName}/contents/${file.filename}?ref=HEAD`,
                            {
                                headers: {
                                    'Authorization': `token ${githubToken}`,
                                    'Accept': 'application/vnd.github.v3.raw'
                                }
                            }
                        );

                        fileContents.push({
                            path: file.filename,
                            content: contentResponse.data
                        });
                    }
                } catch (error) {
                    logger.warn({ error, filename: file.filename }, `Failed to fetch content for ${file.filename}`);
                    // Continue with other files
                }
            }

            return fileContents;
        } catch (error: any) {
            logger.error({ error }, 'Failed to fetch PR files');
            throw new Error('Failed to fetch PR files from GitHub');
        }
    }

    /**
     * Detect programming language from file extension
     */
    private detectLanguage(filename: string): string {
        const ext = filename.split('.').pop()?.toLowerCase();

        const languageMap: Record<string, string> = {
            'ts': 'typescript',
            'tsx': 'typescript',
            'js': 'javascript',
            'jsx': 'javascript',
            'py': 'python',
            'java': 'java',
            'go': 'go',
            'rb': 'ruby',
            'php': 'php',
            'cs': 'csharp',
            'cpp': 'cpp',
            'c': 'c',
            'rs': 'rust',
            'swift': 'swift',
            'kt': 'kotlin'
        };

        return languageMap[ext || ''] || 'unknown';
    }

    /**
     * Check if file is binary
     */
    private isBinaryFile(filename: string): boolean {
        const binaryExtensions = [
            'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg',
            'pdf', 'zip', 'tar', 'gz', 'exe', 'dll',
            'so', 'dylib', 'woff', 'woff2', 'ttf', 'eot'
        ];

        const ext = filename.split('.').pop()?.toLowerCase();
        return binaryExtensions.includes(ext || '');
    }

    /**
     * Calculate overall quality score
     */
    private calculateOverallScore(
        aiScore: number,
        maintainabilityIndex: number,
        bugProbability: number
    ): number {
        // Weighted average
        // AI Score: 40%, Maintainability: 40%, Bug Risk: 20%
        const score = (
            aiScore * 0.4 +
            maintainabilityIndex * 0.4 +
            (100 - bugProbability) * 0.2
        );

        return Math.round(score);
    }

    /**
     * Generate actionable recommendations
     */
    private generateRecommendations(
        aiReview: any,
        qualityMetrics: any,
        bugProbability: any
    ): string[] {
        const recommendations: string[] = [];

        // AI Review recommendations
        if (aiReview?.recommendations) {
            recommendations.push(...aiReview.recommendations);
        }

        // Quality-based recommendations
        if (qualityMetrics.maintainabilityIndex < 50) {
            recommendations.push('Consider refactoring to improve maintainability');
        }

        if (qualityMetrics.cyclomaticComplexity > 20) {
            recommendations.push('Reduce code complexity by breaking down large functions');
        }

        if (qualityMetrics.codeSmells > 10) {
            recommendations.push(`Address ${qualityMetrics.codeSmells} code smells detected`);
        }

        if (qualityMetrics.technicalDebtMinutes > 120) {
            const hours = Math.round(qualityMetrics.technicalDebtMinutes / 60);
            recommendations.push(`Estimated ${hours}h of technical debt - consider cleanup`);
        }

        // Bug probability recommendations
        if (bugProbability?.probability > 60) {
            recommendations.push('High bug risk - thorough testing recommended');
        }

        // If no recommendations, add a positive note
        if (recommendations.length === 0) {
            recommendations.push('Code quality looks good! Ready for review.');
        }

        return recommendations;
    }

    /**
     * Check if AI analysis is available
     */
    isAIAvailable(): boolean {
        return this.geminiService !== null;
    }
}

// Singleton instance
let codeAnalysisServiceInstance: CodeAnalysisService | null = null;

export const getCodeAnalysisService = (): CodeAnalysisService => {
    if (!codeAnalysisServiceInstance) {
        codeAnalysisServiceInstance = new CodeAnalysisService();
    }
    return codeAnalysisServiceInstance;
};
