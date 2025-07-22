import { Router } from 'express';
import { getMe } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', verifyToken, getMe);

export default router; 