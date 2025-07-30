import { User, Wound, WoundLog, Clinic, ForumPost, ForumComment, WoundComment } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from 'sequelize';

// Middleware to ensure admin access
export const requireAdmin = (req, res, next) => {
  console.log(' Admin Debug - User role:', req.user?.role);
  console.log(' Admin Debug - Full user object:', req.user);
  
  if (req.user.role !== 'admin') {
    console.log(' Admin Debug - Access denied for role:', req.user?.role);
    return res.status(403).json({ error: 'Admin access required.' });
  }
  
  console.log(' Admin Debug - Access granted');
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

// Get all comments for a wound (admin and user)
export const getWoundComments = async (req, res) => {
  try {
    // Check if user is admin OR if the wound belongs to the user
    if (req.user.role !== 'admin') {
      const wound = await Wound.findOne({ 
        where: { 
          id: req.params.id, 
          user_id: req.user.id 
        } 
      });
      
      if (!wound) {
        return res.status(403).json({ error: 'Access denied. You can only view comments for your own wounds.' });
      }
    }
    
    const comments = await WoundComment.findAll({
      where: { wound_id: req.params.id },
      include: [{ model: User, as: 'admin', attributes: ['id', 'full_name', 'email'] }],
      order: [['created_at', 'ASC']]
    });
    
    // Transform the response to match frontend expectations
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      comment: comment.comment,
      createdAt: comment.created_at,
      admin: comment.admin
    }));
    
    res.json(transformedComments);
  } catch (err) {
    console.error('Error fetching wound comments:', err);
    res.status(500).json({ error: 'Failed to fetch wound comments.' });
  }
};

// Add a new admin comment to a wound
export const addWoundComment = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ error: 'Comment is required.' });
    const wound = await Wound.findByPk(req.params.id);
    if (!wound) return res.status(404).json({ error: 'Wound not found.' });
    const newComment = await WoundComment.create({
      wound_id: req.params.id,
      admin_id: req.user.id,
      comment
    });
    
    // Fetch the comment with admin user data
    const commentWithAdmin = await WoundComment.findByPk(newComment.id, {
      include: [{ model: User, as: 'admin', attributes: ['id', 'full_name', 'email'] }]
    });
    
    // Transform response to match frontend expectations
    const transformedComment = {
      id: commentWithAdmin.id,
      comment: commentWithAdmin.comment,
      createdAt: commentWithAdmin.created_at,
      admin: commentWithAdmin.admin
    };
    
    res.status(201).json(transformedComment);
  } catch (err) {
    console.error('Error adding wound comment:', err);
    res.status(500).json({ error: 'Failed to add wound comment.' });
  }
};

// Delete an admin comment on a wound (admin only, own comments only)
export const deleteWoundComment = async (req, res) => {
  try {
    console.log('🗑️ Delete comment request:', {
      commentId: req.params.commentId,
      userId: req.user?.id,
      userRole: req.user?.role
    });
    
    const comment = await WoundComment.findByPk(req.params.commentId);
    console.log('📝 Found comment:', comment ? {
      id: comment.id,
      admin_id: comment.admin_id,
      comment: comment.comment.substring(0, 50) + '...'
    } : 'null');
    
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    
    // Only allow admin to delete their own comments
    if (comment.admin_id !== req.user.id) {
      console.log('❌ Access denied - comment admin_id:', comment.admin_id, 'user id:', req.user.id);
      return res.status(403).json({ error: 'You can only delete your own comments.' });
    }
    
    await comment.destroy();
    console.log('✅ Comment deleted successfully');
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('❌ Error deleting wound comment:', err);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
};

// Get all wounds for moderation (admin only)
export const getAllWoundsForModeration = async (req, res) => {
  try {
    const wounds = await Wound.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(wounds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wounds for moderation.' });
  }
};

// Flag/unflag a wound (admin only)
export const flagWound = async (req, res) => {
  try {
    const wound = await Wound.findByPk(req.params.id);
    if (!wound) return res.status(404).json({ error: 'Wound not found.' });
    wound.flagged = !wound.flagged;
    await wound.save();
    res.json(wound);
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag wound.' });
  }
};

// Get moderation queue
export const getModerationQueue = async (req, res) => {
  try {
    const allContent = {
      posts: await ForumPost.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'full_name', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      }),
      comments: await ForumComment.findAll({
        include: [
          {
            model: User,
            attributes: ['id', 'full_name', 'email']
          },
          {
            model: ForumPost,
            attributes: ['id', 'content']
          }
        ],
        order: [['created_at', 'DESC']]
      })
    };
    res.json(allContent);
  } catch (err) {
    console.error('Error fetching moderation queue:', err);
    res.status(500).json({ error: 'Failed to fetch moderation queue.' });
  }
};

// Forum Moderation Functions
export const flagForumPost = async (req, res) => {
  try {
    const post = await ForumPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    
    await post.update({ flagged: true });
    res.json({ message: 'Post flagged successfully.', post });
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag post.' });
  }
};

export const unflagForumPost = async (req, res) => {
  try {
    const post = await ForumPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    
    await post.update({ flagged: false });
    res.json({ message: 'Post unflagged successfully.', post });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unflag post.' });
  }
};

export const deleteForumPost = async (req, res) => {
  try {
    const post = await ForumPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    
    // Delete associated comments first
    await ForumComment.destroy({ where: { post_id: req.params.id } });
    await post.destroy();
    
    res.json({ message: 'Post and associated comments deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post.' });
  }
};

export const flagForumComment = async (req, res) => {
  try {
    const comment = await ForumComment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    
    await comment.update({ flagged: true });
    res.json({ message: 'Comment flagged successfully.', comment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag comment.' });
  }
};

export const unflagForumComment = async (req, res) => {
  try {
    const comment = await ForumComment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    
    await comment.update({ flagged: false });
    res.json({ message: 'Comment unflagged successfully.', comment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unflag comment.' });
  }
};

export const deleteForumComment = async (req, res) => {
  try {
    const comment = await ForumComment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    
    await comment.destroy();
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment.' });
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