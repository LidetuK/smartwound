import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token && req.cookies) {
    token = req.cookies.token;
  }
  
  console.log('🔍 Auth Debug - Token found:', !!token);
  console.log('🔍 Auth Debug - Token source:', authHeader ? 'header' : 'cookie');
  
  if (!token) return res.status(401).json({ error: 'No token provided.' });
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      console.log('🔍 Auth Debug - JWT Error:', err.message);
      return res.status(403).json({ error: 'Invalid token.' });
    }
    
    console.log('🔍 Auth Debug - Decoded user:', user);
    
    // If role is missing from JWT, fetch it from database
    if (!user.role) {
      try {
        const dbUser = await User.findByPk(user.id, {
          attributes: ['role']
        });
        if (dbUser) {
          user.role = dbUser.role;
          console.log('🔍 Auth Debug - Role fetched from DB:', user.role);
        }
      } catch (dbErr) {
        console.log('🔍 Auth Debug - DB fetch error:', dbErr.message);
      }
    }
    
    req.user = user;
    next();
  });
};

export { verifyToken }; 