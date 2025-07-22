import { DataTypes } from 'sequelize';
import { sequelize } from '../db/postgres.js';
import ForumPost from './forumpost.model.js';
import User from './user.model.js';

const ForumComment = sequelize.define('ForumComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  flagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'forum_comments',
  timestamps: false
});

ForumPost.hasMany(ForumComment, { foreignKey: 'post_id' });
ForumComment.belongsTo(ForumPost, { foreignKey: 'post_id' });
User.hasMany(ForumComment, { foreignKey: 'user_id' });
ForumComment.belongsTo(User, { foreignKey: 'user_id' });

export default ForumComment; 