import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  requireAdmin,
  getSystemStats,
  getUsers,
  updateUserRole,
  getWoundStats,
  getModerationQueue,
  getClinicStats,
  getAllWoundsForModeration,
  getWoundComments,
  addWoundComment,
  deleteWoundComment,
  flagWound,
  flagForumPost,
  unflagForumPost,
  flagForumComment,
  unflagForumComment,
  deleteForumPost,
  deleteForumComment
} from '../controllers/adminController.js';

const router = Router();

// Wound comments route - accessible to wound owners and admins
router.get('/wounds/:id/comments', verifyToken, getWoundComments);
router.post('/wounds/:id/comments', verifyToken, requireAdmin, addWoundComment);

// All other routes require authentication and admin role
router.use(verifyToken, requireAdmin);

// Delete wound comment route (admin only)
router.delete('/wound-comments/:commentId', deleteWoundComment);

// System Overview
router.get('/stats', getSystemStats);

// User Management
router.get('/users', getUsers);
router.put('/users/:userId/role', updateUserRole);

// Wound Statistics
router.get('/wounds/stats', getWoundStats);

// Moderation
router.get('/moderation/queue', getModerationQueue);
router.get('/wounds', getAllWoundsForModeration);
router.put('/wounds/:id/flag', flagWound);

// Forum Moderation
router.put('/forum/posts/:id/flag', flagForumPost);
router.put('/forum/posts/:id/unflag', unflagForumPost);
router.delete('/forum/posts/:id', deleteForumPost);
router.put('/forum/comments/:id/flag', flagForumComment);
router.put('/forum/comments/:id/unflag', unflagForumComment);
router.delete('/forum/comments/:id', deleteForumComment);

// Clinic Statistics
router.get('/clinics/stats', getClinicStats);

export default router;