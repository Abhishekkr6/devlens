import { Router } from 'express';
import { handleGuideQuery } from '../controllers/aiGuide.controller';

const router = Router();

// AI Guide endpoint
router.post('/guide', handleGuideQuery);

export default router;
