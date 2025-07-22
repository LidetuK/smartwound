import { DataTypes } from 'sequelize';
import { sequelize } from '../db/postgres.js';
import User from './user.model.js';

const ForumPost = sequelize.define('ForumPost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  wound_type: DataTypes.STRING(50),
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
  tableName: 'forum_posts',
  timestamps: false
});

User.hasMany(ForumPost, { foreignKey: 'user_id' });
ForumPost.belongsTo(User, { foreignKey: 'user_id' });

export default ForumPost; 