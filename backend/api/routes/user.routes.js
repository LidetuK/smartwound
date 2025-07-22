import { Router } from 'express';
import { getMe, updateMe } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateMe);

export default router; 