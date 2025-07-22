import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getClinics,
  getClinic,
  createClinic,
  updateClinic,
  deleteClinic,
  findNearby
} from '../controllers/clinicController.js';

const router = Router();

// Public routes (no auth required)
router.get('/', getClinics);
router.get('/nearby', findNearby);
router.get('/:id', getClinic);

// Admin only routes (requires auth + admin role)
router.post('/', verifyToken, createClinic);
router.put('/:id', verifyToken, updateClinic);
router.delete('/:id', verifyToken, deleteClinic);

export default router; 