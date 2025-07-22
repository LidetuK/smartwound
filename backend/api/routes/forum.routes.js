import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createPost,
  getPosts,
  getPost,
  flagPost,
  deletePost,
  addComment,
  flagComment,
  deleteComment
} from '../controllers/forumController.js';
import { forumPostValidation, forumCommentValidation } from '../middleware/validation.middleware.js';

const router = Router();

// Post routes
router.get('/posts', getPosts);
router.get('/posts/:id', getPost);
router.post('/posts', verifyToken, forumPostValidation, createPost);
router.put('/posts/:id/flag', verifyToken, flagPost);
router.delete('/posts/:id', verifyToken, deletePost);

// Comment routes
router.post('/posts/:postId/comments', verifyToken, forumCommentValidation, addComment);
router.put('/comments/:commentId/flag', verifyToken, flagComment);
router.delete('/comments/:commentId', verifyToken, deleteComment);

export default router; 