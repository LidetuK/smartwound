import { ForumPost, ForumComment, User } from '../models/index.js';
import { Op } from 'sequelize';

// Create a forum post
export const createPost = async (req, res) => {
  try {
    const { wound_type, content } = req.body;
    const post = await ForumPost.create({
      user_id: req.user.id,
      wound_type,
      content
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create post.' });
  }
};

// List/search forum posts
export const getPosts = async (req, res) => {
  try {
    const { wound_type, search } = req.query;
    const where = {};
    
    if (wound_type) where.wound_type = wound_type;
    if (search) {
      where.content = { [Op.iLike]: `%${search}%` };
    }
    
    const posts = await ForumPost.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'full_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
};

// Get single post with comments
export const getPost = async (req, res) => {
  try {
    const post = await ForumPost.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'full_name']
        },
        {
          model: ForumComment,
          include: [
            {
              model: User,
              attributes: ['id', 'full_name']
            }
          ]
        }
      ]
    });
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
};

// Flag/unflag a post (moderation)
export const flagPost = async (req, res) => {
  try {
    const post = await ForumPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    
    await post.update({ flagged: !post.flagged });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag post.' });
  }
};

// Delete a post (admin or owner only)
export const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    
    if (req.user.role !== 'admin' && post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post.' });
    }
    
    await post.destroy();
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post.' });
  }
};

// Add a comment
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await ForumPost.findByPk(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    
    const comment = await ForumComment.create({
      post_id: post.id,
      user_id: req.user.id,
      content
    });
    
    const commentWithUser = await ForumComment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'full_name']
        }
      ]
    });
    
    res.status(201).json(commentWithUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment.' });
  }
};

// Flag/unflag a comment
export const flagComment = async (req, res) => {
  try {
    const comment = await ForumComment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    
    await comment.update({ flagged: !comment.flagged });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag comment.' });
  }
};

// Delete a comment (admin or owner only)
export const deleteComment = async (req, res) => {
  try {
    const comment = await ForumComment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    
    if (req.user.role !== 'admin' && comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment.' });
    }
    
    await comment.destroy();
    res.json({ message: 'Comment deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
}; 