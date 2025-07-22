import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { analyzeImage } from '../controllers/visionController.js';

const router = Router();

router.post('/analyze', verifyToken, analyzeImage);

export default router; 