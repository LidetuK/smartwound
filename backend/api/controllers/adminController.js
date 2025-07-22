import { User, Wound, WoundLog, Clinic, ForumPost, ForumComment } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from 'sequelize';

// Middleware to ensure admin access
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

// Get system overview statistics
export const getSystemStats = async (req, res) => {
  try {
    const stats = {
      users: await User.count(),
      wounds: await Wound.count(),
      woundLogs: await WoundLog.count(),
      clinics: await Clinic.count(),
      forumPosts: await ForumPost.count(),
      forumComments: await ForumComment.count(),
      flaggedContent: {
        posts: await ForumPost.count({ where: { flagged: true } }),
        comments: await ForumComment.count({ where: { flagged: true } })
      }
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch system statistics.' });
  }
};

// User Management
export const getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { full_name: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role) where.role = role;
    
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.userId);
    
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (!['user', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    
    await user.update({ role });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
};

// Get wound statistics
export const getWoundStats = async (req, res) => {
  try {
    const stats = {
      totalWounds: await Wound.count(),
      byType: await Wound.findAll({
        attributes: ['type', [sequelize.fn('count', '*'), 'count']],
        group: ['type']
      }),
      bySeverity: await Wound.findAll({
        attributes: ['severity', [sequelize.fn('count', '*'), 'count']],
        group: ['severity']
      }),
      byStatus: await Wound.findAll({
        attributes: ['status', [sequelize.fn('count', '*'), 'count']],
        group: ['status']
      })
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wound statistics.' });
  }
};

// Get moderation queue
export const getModerationQueue = async (req, res) => {
  try {
    const flaggedContent = {
      posts: await ForumPost.findAll({
        where: { flagged: true },
        include: [
          {
            model: User,
            attributes: ['id', 'full_name', 'email']
          }
        ]
      }),
      comments: await ForumComment.findAll({
        where: { flagged: true },
        include: [
          {
            model: User,
            attributes: ['id', 'full_name', 'email']
          },
          {
            model: ForumPost,
            attributes: ['id', 'content']
          }
        ]
      })
    };
    res.json(flaggedContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moderation queue.' });
  }
};

// Get clinic statistics
export const getClinicStats = async (req, res) => {
  try {
    const stats = {
      totalClinics: await Clinic.count(),
      byCountry: await Clinic.findAll({
        attributes: ['country', [sequelize.fn('count', '*'), 'count']],
        group: ['country']
      }),
      byCity: await Clinic.findAll({
        attributes: ['city', [sequelize.fn('count', '*'), 'count']],
        group: ['city']
      })
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clinic statistics.' });
  }
}; 