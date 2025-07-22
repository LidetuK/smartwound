import { DataTypes } from 'sequelize';
import { sequelize } from '../db/postgres.js';
import Wound from './wound.model.js';

const WoundLog = sequelize.define('WoundLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  wound_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  photo_url: DataTypes.STRING(500),
  notes: DataTypes.TEXT,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'wound_logs',
  timestamps: false
});

Wound.hasMany(WoundLog, { foreignKey: 'wound_id' });
WoundLog.belongsTo(Wound, { foreignKey: 'wound_id' });

export default WoundLog; 