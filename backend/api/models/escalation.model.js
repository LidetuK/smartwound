import { DataTypes } from 'sequelize';
import { sequelize } from '../db/postgres.js';
import User from './user.model.js';
import Wound from './wound.model.js';

const Escalation = sequelize.define('Escalation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  wound_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending', // e.g., pending, reviewed, resolved
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  resolved_at: {
    type: DataTypes.DATE,
  },
  resolved_by: { // The admin/doctor who resolved it
    type: DataTypes.UUID,
  }
}, {
  tableName: 'escalations',
  timestamps: false,
});

Wound.hasOne(Escalation, { foreignKey: 'wound_id' });
Escalation.belongsTo(Wound, { foreignKey: 'wound_id' });

export default Escalation; 