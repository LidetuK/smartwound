import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { sequelize } from './api/db/postgres.js';
import authRoutes from './api/routes/auth.routes.js';
import userRoutes from './api/routes/user.routes.js';
import woundRoutes from './api/routes/wound.routes.js';
import clinicRoutes from './api/routes/clinic.routes.js';
import forumRoutes from './api/routes/forum.routes.js';
import uploadRoutes from './api/routes/upload.routes.js';
import chatbotRoutes from './api/routes/chatbot.routes.js';
import visionRoutes from './api/routes/vision.routes.js';
import smartRoutes from './api/routes/smart.routes.js';
import adminRoutes from './api/routes/admin.routes.js';
import supportRoutes from './api/routes/support.routes.js';

import './api/models/index.js';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gentle-eagerness-production-c7b5.up.railway.app', 'http://localhost:3000']
    : 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wounds', woundRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/smart', smartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Smart Wound Backend API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Additional health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple ping endpoint for basic connectivity
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// For Vercel serverless
export default app;

// Start server (always start in local development)
const port = process.env.PORT || 3001;
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', port);
console.log('Database URL exists:', !!process.env.DATABASE_URL);
console.log('JWT Secret exists:', !!process.env.JWT_SECRET);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Server started successfully!');
  console.log('Health check available at: http://localhost:' + port + '/');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Database sync in background
setTimeout(() => {
  console.log('Attempting database sync...');
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('Database synced successfully');
    })
    .catch((error) => {
      console.error('Database sync failed:', error);
      // Don't exit the process, just log the error
      // The app can still run without database sync
    });
}, 2000); 