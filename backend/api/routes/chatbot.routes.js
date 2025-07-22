import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { handleChat } from '../controllers/chatbotController.js';

const router = Router();

router.post('/', verifyToken, handleChat);

export default router; 