import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = Router();

router.post('/', [verifyToken, upload.single('image')], (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  
  // Check if using Cloudinary or local storage
  const isCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
  
  if (isCloudinary) {
    // Return Cloudinary URL and public_id
    res.status(200).json({
      message: 'File uploaded successfully',
      url: req.file.path, // Cloudinary URL
      public_id: req.file.filename // Cloudinary public_id
    });
  } else {
    // Return local file path
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.status(200).json({
      message: 'File uploaded successfully',
      url: fileUrl, // Local file URL
      public_id: req.file.filename // Local filename
    });
  }
});

export default router; 