import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createWound,
  getWounds,
  getWound,
  updateWound,
  deleteWound,
  addWoundLog,
  getWoundLogs
} from '../controllers/woundController.js';
import { woundValidation } from '../middleware/validation.middleware.js';

const router = Router();

router.post('/', verifyToken, woundValidation, createWound);
router.get('/', verifyToken, getWounds);
router.get('/:id', verifyToken, getWound);
router.put('/:id', verifyToken, woundValidation, updateWound);
router.delete('/:id', verifyToken, deleteWound);

router.post('/:woundId/logs', verifyToken, addWoundLog);
router.get('/:woundId/logs', verifyToken, getWoundLogs);

export default router; 