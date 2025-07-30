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
  origin: 'http://localhost:3000',
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

app.get('/', (req, res) => {
  res.json({ message: 'Smart Wound Backend API' });
});

// For Vercel serverless
export default app;

// Start server (always start in local development)
const port = process.env.PORT || 3001;
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV || 'development');

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Server started successfully!');
});

// Database sync in background
setTimeout(() => {
  console.log('Attempting database sync...');
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('Database synced successfully');
    })
    .catch((error) => {
      console.error('Database sync failed:', error);
    });
}, 1000); 