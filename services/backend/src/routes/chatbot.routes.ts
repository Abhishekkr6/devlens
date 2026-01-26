import { Router } from 'express';
import * as chatbotController from '../controllers/chatbot.controller';
import { authMiddleware as requireAuth } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for chatbot (20 queries per hour per user)
const chatbotRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        success: false,
        error: { message: 'Too many chatbot queries. Please try again later.' }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const user = (req as any).user;
        return user?.id || req.ip || 'anonymous';
    }
});

/**
 * POST /api/v1/chatbot/query
 * Send a query to the chatbot
 */
router.post('/query', requireAuth, chatbotRateLimiter, chatbotController.sendQuery);

/**
 * GET /api/v1/chatbot/history/:orgId
 * Get conversation history for an organization
 */
router.get('/history/:orgId', requireAuth, chatbotController.getHistory);

/**
 * DELETE /api/v1/chatbot/history/:orgId
 * Clear conversation history for an organization
 */
router.delete('/history/:orgId', requireAuth, chatbotController.clearHistory);

/**
 * GET /api/v1/chatbot/status
 * Check chatbot availability and features
 */
router.get('/status', chatbotController.getChatbotStatus);

export default router;
