import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authMiddleware as requireAuth } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for AI endpoints (10 requests per hour per user)
const aiRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        error: { message: 'AI analysis rate limit exceeded. Please try again later.' }
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        const user = (req as any).user;
        return user?.id || req.ip || 'anonymous';
    },
    validate: { trustProxy: false }
});

/**
 * POST /api/v1/ai/analyze-pr
 * Analyze a Pull Request with AI
 */
router.post('/analyze-pr', requireAuth, aiRateLimiter, aiController.analyzePR);

/**
 * GET /api/v1/ai/insights/:prId
 * Get AI insights for a specific PR
 */
router.get('/insights/:prId', requireAuth, aiController.getPRInsights);

/**
 * GET /api/v1/ai/quality/:repoId
 * Get code quality metrics for a repository
 */
router.get('/quality/:repoId', requireAuth, aiController.getRepoQuality);

/**
 * GET /api/v1/ai/security/:repoId
 * Get security alerts for a repository
 */
router.get('/security/:repoId', requireAuth, aiController.getSecurityAlerts);

/**
 * POST /api/v1/ai/security/:alertId/resolve
 * Resolve a security alert
 */
router.post('/security/:alertId/resolve', requireAuth, aiController.resolveSecurityAlert);

/**
 * GET /api/v1/ai/status
 * Check AI features availability
 */
router.get('/status', aiController.getAIStatus);

export default router;
