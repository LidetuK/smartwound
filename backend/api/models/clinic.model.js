import { DataTypes } from 'sequelize';
import { sequelize } from '../db/postgres.js';

const Clinic = sequelize.define('Clinic', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  address: DataTypes.STRING(500),
  city: DataTypes.STRING(100),
  country: DataTypes.STRING(100),
  phone: DataTypes.STRING(50),
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'clinics',
  timestamps: false
});

export default Clinic; 