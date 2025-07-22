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
import './api/models/index.js'; 

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wounds', woundRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/smart', smartRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Smart Wound Backend API' });
});

// For Vercel serverless
export default app;

// For local dev
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  // Sync database and start server
  sequelize.sync({ alter: true }).then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  });
} 