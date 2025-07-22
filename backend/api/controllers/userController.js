import { User } from '../models/index.js';

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

const updateMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    // Only allow updating certain fields
    const updatableFields = [
      'full_name', 'gender', 'date_of_birth', 'phone_number', 'country', 'city',
      'known_conditions', 'allergies', 'medication', 'privacy_consent', 'profile_pic'
    ];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

export { getMe, updateMe }; 