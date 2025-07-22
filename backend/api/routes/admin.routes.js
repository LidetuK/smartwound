import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  requireAdmin,
  getSystemStats,
  getUsers,
  updateUserRole,
  getWoundStats,
  getModerationQueue,
  getClinicStats
} from '../controllers/adminController.js';

const router = Router();

// All routes require authentication and admin role
router.use(verifyToken, requireAdmin);

// System Overview
router.get('/stats', getSystemStats);

// User Management
router.get('/users', getUsers);
router.put('/users/:userId/role', updateUserRole);

// Wound Statistics
router.get('/wounds/stats', getWoundStats);

// Moderation
router.get('/moderation/queue', getModerationQueue);

// Clinic Statistics
router.get('/clinics/stats', getClinicStats);

export default router; 