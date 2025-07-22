import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', [verifyToken, upload.single('image')], (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  res.status(200).json({
    message: 'File uploaded successfully',
    url: req.file.path
  });
});

export default router; 