import { Request, Response } from 'express';
import { getChatbotService } from '../services/ai/chatbot.service';
import { ChatMessageModel } from '../models/chatMessage.model';
import logger from '../utils/logger';

export const sendQuery = async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const { query, orgId } = req.body;
        const userId = (req as any).user?.id;

        if (!query || !orgId) {
            return res.status(400).json({
                success: false,
                error: { message: 'Query and orgId are required' }
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: { message: 'User not authenticated' }
            });
        }

        logger.info({ query, orgId, userId }, 'Processing chatbot query');

        const chatbotService = getChatbotService();

        if (!chatbotService.isAvailable()) {
            return res.status(503).json({
                success: false,
                error: { message: 'Chatbot service is currently unavailable. Please try again later.' }
            });
        }

        const result = await chatbotService.processQuery({
            query,
            orgId,
            userId
        });

        const processingTimeMs = Date.now() - startTime;

        // Save to conversation history
        try {
            await ChatMessageModel.create({
                userId,
                orgId,
                message: query,
                response: result.message,
                intent: result.intent,
                metadata: {
                    confidence: 0.8,
                    dataReturned: !!result.data,
                    processingTimeMs
                }
            });
        } catch (saveError) {
            logger.warn({ error: saveError }, 'Failed to save chat message to history');
        }

        logger.info({
            intent: result.intent,
            processingTimeMs,
            userId
        }, 'Chatbot query processed successfully');

        return res.status(200).json({
            success: true,
            data: {
                message: result.message,
                intent: result.intent,
                suggestions: result.suggestions,
                processingTimeMs
            }
        });
    } catch (error: any) {
        logger.error({ error }, 'Chatbot query failed');
        return res.status(500).json({
            success: false,
            error: { message: error.message || 'Failed to process chatbot query' }
        });
    }
};

export const getHistory = async (req: Request, res: Response) => {
    try {
        const { orgId } = req.params;
        const userId = (req as any).user?.id;
        const limit = parseInt(req.query.limit as string) || 50;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: { message: 'User not authenticated' }
            });
        }

        const history = await ChatMessageModel.find({
            userId,
            orgId
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('message response intent createdAt')
            .lean();

        return res.status(200).json({
            success: true,
            data: history.reverse() // Oldest first for chat display
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to fetch chat history');
        return res.status(500).json({
            success: false,
            error: { message: 'Failed to fetch chat history' }
        });
    }
};

export const clearHistory = async (req: Request, res: Response) => {
    try {
        const { orgId } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: { message: 'User not authenticated' }
            });
        }

        const result = await ChatMessageModel.deleteMany({
            userId,
            orgId
        });

        logger.info({ userId, orgId, deletedCount: result.deletedCount }, 'Chat history cleared');

        return res.status(200).json({
            success: true,
            data: { deletedCount: result.deletedCount }
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to clear chat history');
        return res.status(500).json({
            success: false,
            error: { message: 'Failed to clear chat history' }
        });
    }
};

export const getChatbotStatus = async (_req: Request, res: Response) => {
    try {
        const chatbotService = getChatbotService();
        const isAvailable = chatbotService.isAvailable();

        return res.status(200).json({
            success: true,
            data: {
                available: isAvailable,
                features: {
                    naturalLanguageQueries: isAvailable,
                    conversationHistory: true,
                    intentClassification: isAvailable,
                    dataIntegration: true
                },
                supportedIntents: [
                    'pr_list',
                    'developer_stats',
                    'commit_history',
                    'code_quality',
                    'security_alerts',
                    'repo_metrics',
                    'app_guide',
                    'help',
                    'general'
                ]
            }
        });
    } catch (error: any) {
        logger.error({ error }, 'Failed to get chatbot status');
        return res.status(500).json({
            success: false,
            error: { message: 'Failed to get chatbot status' }
        });
    }
};
