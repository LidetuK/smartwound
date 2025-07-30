import { DataTypes } from 'sequelize';
import { sequelize } from '../db/postgres.js';
import Wound from './wound.model.js';
import User from './user.model.js';

const WoundComment = sequelize.define('WoundComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  wound_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  admin_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'wound_comments',
  timestamps: false
});

Wound.hasMany(WoundComment, { foreignKey: 'wound_id' });
WoundComment.belongsTo(Wound, { foreignKey: 'wound_id' });
User.hasMany(WoundComment, { foreignKey: 'admin_id' });
WoundComment.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

export default WoundComment;
