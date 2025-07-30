import { DataTypes } from 'sequelize';
import { sequelize } from '../db/postgres.js';
import User from './user.model.js';

const Wound = sequelize.define('Wound', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  severity: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  image_url: DataTypes.STRING(500),
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'open'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  flagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'wounds',
  timestamps: false
});

User.hasMany(Wound, { foreignKey: 'user_id' });
Wound.belongsTo(User, { foreignKey: 'user_id' });

export default Wound; 