import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './api/db/postgres.js';
import authRoutes from './api/routes/auth.routes.js';
import userRoutes from './api/routes/user.routes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Smart Wound Backend API' });
});

// For Vercel serverless
export default app;

// For local dev
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
} 