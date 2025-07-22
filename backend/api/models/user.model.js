import { DataTypes } from 'sequelize';
import { sequelize } from '../db/postgres.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'doctor', 'admin']]
    }
  },
  full_name: DataTypes.STRING(255),
  gender: {
    type: DataTypes.STRING(10),
    validate: {
      isIn: [['male', 'female', 'other']]
    }
  },
  date_of_birth: DataTypes.DATEONLY,
  phone_number: DataTypes.STRING(20),
  country: DataTypes.STRING(100),
  city: DataTypes.STRING(100),
  known_conditions: DataTypes.ARRAY(DataTypes.TEXT),
  allergies: DataTypes.ARRAY(DataTypes.TEXT),
  medication: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
  },
  profile_pic: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  privacy_consent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  verification_token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verification_token_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false
});

export default User; 