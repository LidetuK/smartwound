import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Cloudinary config (use environment variables for security)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wound-images', // All images go into this folder in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1024, height: 1024, crop: 'limit' }],
  },
});

const upload = multer({ storage });

export default upload; 