import { getGeminiService } from './gemini.service';
import logger from '../../utils/logger';
import { PRModel } from '../../models/pr.model';
import { CommitModel } from '../../models/commit.model';
import { RepoModel } from '../../models/repo.model';
import { UserModel } from '../../models/user.model';
import { AlertModel } from '../../models/alert.model';
import mongoose from 'mongoose';

interface ChatQuery {
    query: string;
    orgId: string;
    userId: string;
}

interface ChatResponse {
    message: string;
    data?: any;
    intent: string;
    suggestions?: string[];
}

interface QueryIntent {
    type: 'pr_list' | 'developer_stats' | 'commit_history' | 'code_quality' | 'security_alerts' | 'repo_metrics' | 'general' | 'help';
    filters?: {
        timeRange?: string;
        riskLevel?: string;
        developer?: string;
        repository?: string;
        status?: string;
    };
    confidence: number;
}

export class ChatbotService {
    private geminiService: any;

    constructor() {
        try {
            this.geminiService = getGeminiService();
        } catch (error) {
            logger.warn({ error }, 'Gemini service not available for chatbot');
            this.geminiService = null;
        }
    }

    async processQuery(query: ChatQuery): Promise<ChatResponse> {
        try {
            logger.info({ query: query.query, orgId: query.orgId }, 'Processing chatbot query');

            // Step 1: Understand user intent using Gemini
            const intent = await this.classifyIntent(query.query);

            logger.info({ intent }, 'Query intent classified');

            // Step 2: Fetch relevant data based on intent
            const data = await this.fetchDataForIntent(intent, query.orgId);

            // Step 3: Generate natural language response
            const response = await this.generateResponse(query.query, intent, data);

            return {
                message: response,
                data,
                intent: intent.type,
                suggestions: this.getSuggestions(intent.type)
            };
        } catch (error: any) {
            logger.error({ error, query }, 'Chatbot query processing failed');
            return {
                message: 'Sorry, I encountered an error processing your request. Please try again or rephrase your question.',
                intent: 'error',
                suggestions: [
                    'Show me all PRs',
                    'Which developer is most active?',
                    'What are the security alerts?'
                ]
            };
        }
    }

    private async classifyIntent(query: string): Promise<QueryIntent> {
        if (!this.geminiService) {
            return this.fallbackIntentClassification(query);
        }

        try {
            const prompt = `
You are an intent classifier for a GitHub repository management platform called DevLens.

User Query: "${query}"

Classify this query into one of these intents and extract relevant filters:

Intent Types:
- pr_list: User wants to see pull requests
- developer_stats: User wants developer activity/statistics
- commit_history: User wants to see commits
- code_quality: User wants code quality metrics
- security_alerts: User wants security alerts
- repo_metrics: User wants repository metrics
- help: User needs help/guidance
- general: General conversation

Filters to extract (if applicable):
- timeRange: "today", "this week", "last week", "this month", "last month"
- riskLevel: "high", "medium", "low", "critical"
- developer: developer name if mentioned
- repository: repository name if mentioned
- status: "open", "closed", "merged"

Respond in JSON format:
{
  "type": "intent_type",
  "filters": {
    "timeRange": "extracted_time_range",
    "riskLevel": "extracted_risk_level",
    "developer": "extracted_developer_name",
    "repository": "extracted_repo_name",
    "status": "extracted_status"
  },
  "confidence": 0.0-1.0
}

Only include filters that are explicitly mentioned or strongly implied.
`;

            const result = await this.geminiService.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    type: parsed.type || 'general',
                    filters: parsed.filters || {},
                    confidence: parsed.confidence || 0.5
                };
            }

            return this.fallbackIntentClassification(query);
        } catch (error) {
            logger.warn({ error }, 'Intent classification failed, using fallback');
            return this.fallbackIntentClassification(query);
        }
    }

    private fallbackIntentClassification(query: string): QueryIntent {
        const lowerQuery = query.toLowerCase();

        // PR queries
        if (lowerQuery.includes('pr') || lowerQuery.includes('pull request')) {
            return {
                type: 'pr_list',
                filters: {
                    riskLevel: lowerQuery.includes('high-risk') || lowerQuery.includes('risky') ? 'high' : undefined,
                    status: lowerQuery.includes('open') ? 'open' : lowerQuery.includes('closed') ? 'closed' : undefined,
                    timeRange: this.extractTimeRange(lowerQuery)
                },
                confidence: 0.8
            };
        }

        // Developer stats
        if (lowerQuery.includes('developer') || lowerQuery.includes('who') || lowerQuery.includes('active')) {
            return {
                type: 'developer_stats',
                filters: { timeRange: this.extractTimeRange(lowerQuery) },
                confidence: 0.8
            };
        }

        // Commits
        if (lowerQuery.includes('commit')) {
            return {
                type: 'commit_history',
                filters: { timeRange: this.extractTimeRange(lowerQuery) },
                confidence: 0.8
            };
        }

        // Code quality
        if (lowerQuery.includes('quality') || lowerQuery.includes('score') || lowerQuery.includes('maintainability')) {
            return { type: 'code_quality', confidence: 0.8 };
        }

        // Security
        if (lowerQuery.includes('security') || lowerQuery.includes('alert') || lowerQuery.includes('vulnerability')) {
            return { type: 'security_alerts', confidence: 0.8 };
        }

        // Help
        if (lowerQuery.includes('help') || lowerQuery.includes('how') || lowerQuery.includes('what can you')) {
            return { type: 'help', confidence: 0.9 };
        }

        return { type: 'general', confidence: 0.5 };
    }

    private extractTimeRange(query: string): string | undefined {
        if (query.includes('today')) return 'today';
        if (query.includes('this week')) return 'this week';
        if (query.includes('last week')) return 'last week';
        if (query.includes('this month')) return 'this month';
        if (query.includes('last month')) return 'last month';
        return undefined;
    }

    private async fetchDataForIntent(intent: QueryIntent, orgId: string): Promise<any> {
        const orgObjectId = new mongoose.Types.ObjectId(orgId);

        try {
            switch (intent.type) {
                case 'pr_list':
                    return await this.fetchPRs(orgObjectId, intent.filters);

                case 'developer_stats':
                    return await this.fetchDeveloperStats(orgObjectId, intent.filters);

                case 'commit_history':
                    return await this.fetchCommits(orgObjectId, intent.filters);

                case 'code_quality':
                    return await this.fetchCodeQuality(orgObjectId);

                case 'security_alerts':
                    return await this.fetchSecurityAlerts(orgObjectId);

                case 'repo_metrics':
                    return await this.fetchRepoMetrics(orgObjectId);

                case 'help':
                    return this.getHelpContent();

                default:
                    return null;
            }
        } catch (error) {
            logger.error({ error, intent }, 'Failed to fetch data for intent');
            return null;
        }
    }

    private async fetchPRs(orgId: mongoose.Types.ObjectId, filters?: any) {
        const query: any = { orgId };

        if (filters?.status) {
            query.state = filters.status;
        }

        if (filters?.riskLevel === 'high') {
            query.riskScore = { $gte: 70 };
        }

        if (filters?.timeRange) {
            const dateFilter = this.getDateFilter(filters.timeRange);
            if (dateFilter) {
                query.createdAt = dateFilter;
            }
        }

        const prs = await PRModel.find(query)
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('repoId', 'repoFullName')
            .lean();

        return {
            count: prs.length,
            prs: prs.map(pr => ({
                title: pr.title,
                number: pr.number,
                state: pr.state,
                riskScore: pr.riskScore,
                repository: (pr.repoId as any)?.repoFullName,
                author: pr.authorGithubId || 'Unknown',
                createdAt: pr.createdAt
            }))
        };
    }

    private async fetchDeveloperStats(orgId: mongoose.Types.ObjectId, filters?: any) {
        const dateFilter = filters?.timeRange ? this.getDateFilter(filters.timeRange) : undefined;
        const matchStage: any = { orgId };

        if (dateFilter) {
            matchStage.timestamp = dateFilter;
        }

        const stats = await CommitModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$authorName',
                    commitCount: { $sum: 1 },
                    totalAdditions: { $sum: '$additions' },
                    totalDeletions: { $sum: '$deletions' },
                    lastCommit: { $max: '$timestamp' }
                }
            },
            { $sort: { commitCount: -1 } },
            { $limit: 10 }
        ]);

        return {
            topDevelopers: stats.map(s => ({
                developer: s._id,
                commits: s.commitCount,
                additions: s.totalAdditions,
                deletions: s.totalDeletions,
                lastActive: s.lastCommit
            }))
        };
    }

    private async fetchCommits(orgId: mongoose.Types.ObjectId, filters?: any) {
        const query: any = { orgId };

        if (filters?.timeRange) {
            const dateFilter = this.getDateFilter(filters.timeRange);
            if (dateFilter) {
                query.timestamp = dateFilter;
            }
        }

        const commits = await CommitModel.find(query)
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('repoId', 'repoFullName')
            .lean();

        return {
            count: commits.length,
            commits: commits.map(c => ({
                message: c.message,
                author: c.authorName || c.authorGithubId || 'Unknown',
                repository: (c.repoId as any)?.repoFullName,
                timestamp: c.timestamp,
                stats: {
                    additions: c.additions || 0,
                    deletions: c.deletions || 0
                }
            }))
        };
    }

    private async fetchCodeQuality(orgId: mongoose.Types.ObjectId) {
        const prs = await PRModel.find({ orgId })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const avgRiskScore = prs.length > 0
            ? prs.reduce((sum, pr) => sum + (pr.riskScore || 0), 0) / prs.length
            : 0;

        return {
            averageRiskScore: Math.round(avgRiskScore),
            totalPRsAnalyzed: prs.length,
            highRiskCount: prs.filter(pr => (pr.riskScore || 0) >= 70).length
        };
    }

    private async fetchSecurityAlerts(orgId: mongoose.Types.ObjectId) {
        const alerts = await AlertModel.find({
            orgId,
            resolvedAt: null
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('repoId', 'repoFullName')
            .lean();

        return {
            count: alerts.length,
            alerts: alerts.map(a => ({
                type: a.type,
                severity: a.severity,
                details: a.metadata || {},
                repository: (a.repoId as any)?.repoFullName,
                timestamp: (a as any).createdAt
            }))
        };
    }

    private async fetchRepoMetrics(orgId: mongoose.Types.ObjectId) {
        const repos = await RepoModel.find({ orgId }).lean();
        const totalCommits = await CommitModel.countDocuments({ orgId });
        const totalPRs = await PRModel.countDocuments({ orgId });

        return {
            totalRepositories: repos.length,
            totalCommits,
            totalPRs,
            repositories: repos.map(r => ({
                name: r.repoFullName,
                connected: true
            }))
        };
    }

    private getHelpContent() {
        return {
            capabilities: [
                'Show pull requests (e.g., "Show me all high-risk PRs")',
                'Developer statistics (e.g., "Which developer is most active?")',
                'Commit history (e.g., "Show commits from today")',
                'Code quality metrics (e.g., "What\'s the average code quality?")',
                'Security alerts (e.g., "List all security alerts")',
                'Repository metrics (e.g., "How many repos are connected?")'
            ],
            examples: [
                'Show me all open PRs',
                'Which developer committed the most this week?',
                'What are the high-risk PRs?',
                'Show commits from today',
                'List all security alerts'
            ]
        };
    }

    private async generateResponse(query: string, intent: QueryIntent, data: any): Promise<string> {
        if (!this.geminiService || !data) {
            return this.generateFallbackResponse(intent, data);
        }

        try {
            const prompt = `
You are DevLens AI Assistant, a helpful chatbot for a GitHub repository management platform.

User Query: "${query}"
Intent: ${intent.type}
Data: ${JSON.stringify(data, null, 2)}

Generate a natural, conversational response that:
1. Directly answers the user's question
2. Highlights key insights from the data
3. Is concise (2-3 sentences max)
4. Uses a friendly, professional tone
5. Includes specific numbers/names from the data

Do NOT include any JSON or markdown formatting. Just plain text response.
`;

            const result = await this.geminiService.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            logger.warn({ error }, 'Response generation failed, using fallback');
            return this.generateFallbackResponse(intent, data);
        }
    }

    private generateFallbackResponse(intent: QueryIntent, data: any): string {
        if (!data) {
            return 'I couldn\'t find any data for your query. Please try rephrasing or ask something else.';
        }

        switch (intent.type) {
            case 'pr_list':
                return `I found ${data.count} pull request${data.count !== 1 ? 's' : ''} matching your criteria. ${data.prs.length > 0 ? `The most recent one is "${data.prs[0].title}" by ${data.prs[0].author}.` : ''}`;

            case 'developer_stats':
                if (data.topDevelopers && data.topDevelopers.length > 0) {
                    const top = data.topDevelopers[0];
                    return `${top.developer} is the most active developer with ${top.commits} commits. They've added ${top.additions} lines and removed ${top.deletions} lines.`;
                }
                return 'No developer activity found for the specified time range.';

            case 'commit_history':
                return `I found ${data.count} commit${data.count !== 1 ? 's' : ''}. ${data.commits.length > 0 ? `The latest commit is "${data.commits[0].message}" by ${data.commits[0].author}.` : ''}`;

            case 'code_quality':
                return `The average risk score across recent PRs is ${data.averageRiskScore}/100. ${data.highRiskCount} out of ${data.totalPRsAnalyzed} PRs are considered high-risk.`;

            case 'security_alerts':
                return `There are ${data.count} active security alert${data.count !== 1 ? 's' : ''}. ${data.alerts.length > 0 ? `The most recent one is a ${data.alerts[0].severity} severity ${data.alerts[0].type} alert.` : ''}`;

            case 'repo_metrics':
                return `You have ${data.totalRepositories} connected repositories with ${data.totalCommits} total commits and ${data.totalPRs} pull requests.`;

            case 'help':
                return 'I can help you with pull requests, developer stats, commits, code quality, security alerts, and repository metrics. Try asking "Show me all high-risk PRs" or "Which developer is most active?"';

            default:
                return 'I\'m here to help! You can ask me about pull requests, developers, commits, code quality, security alerts, or repository metrics.';
        }
    }

    private getDateFilter(timeRange: string): any {
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case 'today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'this week':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'last week':
                const lastWeekEnd = new Date(now.setDate(now.getDate() - now.getDay()));
                const lastWeekStart = new Date(lastWeekEnd);
                lastWeekStart.setDate(lastWeekStart.getDate() - 7);
                return { $gte: lastWeekStart, $lt: lastWeekEnd };
            case 'this month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'last month':
                const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
                return { $gte: lastMonthStart, $lt: lastMonthEnd };
            default:
                return undefined;
        }

        return { $gte: startDate };
    }

    private getSuggestions(intentType: string): string[] {
        const suggestions: Record<string, string[]> = {
            pr_list: [
                'Show me high-risk PRs',
                'List all open PRs',
                'Show PRs from this week'
            ],
            developer_stats: [
                'Who committed the most today?',
                'Show developer activity this week',
                'Which developer is most active?'
            ],
            commit_history: [
                'Show commits from today',
                'List recent commits',
                'Show commits this week'
            ],
            code_quality: [
                'What\'s the average code quality?',
                'Show code quality trends',
                'How many high-risk PRs?'
            ],
            security_alerts: [
                'List all security alerts',
                'Show critical alerts',
                'What are the active alerts?'
            ],
            help: [
                'Show me all PRs',
                'Which developer is most active?',
                'What are the security alerts?'
            ]
        };

        return suggestions[intentType] || suggestions.help;
    }

    isAvailable(): boolean {
        return this.geminiService !== null;
    }
}

let chatbotServiceInstance: ChatbotService | null = null;

export const getChatbotService = (): ChatbotService => {
    if (!chatbotServiceInstance) {
        chatbotServiceInstance = new ChatbotService();
    }
    return chatbotServiceInstance;
};
