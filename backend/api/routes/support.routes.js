import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { sendSupport } from '../controllers/supportController.js';
import { body } from 'express-validator';

const router = Router();

// Validation middleware for support email
const supportEmailValidation = [
  body('subject').notEmpty().withMessage('Subject is required.'),
  body('message').notEmpty().withMessage('Message is required.'),
];

// Send support email
router.post('/email', verifyToken, supportEmailValidation, sendSupport);

export default router;
