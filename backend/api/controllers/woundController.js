import { Wound, WoundLog, WoundComment, User } from '../models/index.js';

// Create a new wound
export const createWound = async (req, res) => {
  try {
    const { type, severity, image_url, status, notes } = req.body;
    // Validate that image_url is a Cloudinary URL
    if (!image_url || typeof image_url !== 'string' || !image_url.startsWith('https://res.cloudinary.com/')) {
      return res.status(400).json({ error: 'Invalid image_url. Only Cloudinary URLs are allowed.' });
    }
    const wound = await Wound.create({
      user_id: req.user.id,
      type,
      severity,
      image_url,
      status,
      notes,
    });
    res.status(201).json(wound);
  } catch (err) {
    console.error("Error creating wound:", err);
    res.status(500).json({ error: 'Failed to create wound.', details: err.message });
  }
};

// Get all wounds for current user
export const getWounds = async (req, res) => {
  try {
    console.log('Fetching wounds for user:', req.user.id);
    const wounds = await Wound.findAll({ 
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });
    console.log('Found wounds:', wounds.length);
    console.log('Sample wound data:', wounds[0] ? {
      id: wounds[0].id,
      type: wounds[0].type,
      flagged: wounds[0].flagged,
      status: wounds[0].status
    } : 'No wounds found');
    res.json(wounds);
  } catch (err) {
    console.error('Error fetching wounds:', err);
    res.status(500).json({ error: 'Failed to fetch wounds.', details: err.message });
  }
};

// Get a single wound
export const getWound = async (req, res) => {
  try {
    const wound = await Wound.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!wound) return res.status(404).json({ error: 'Wound not found.' });
    
    // If wound is flagged, include admin comments
    let adminComments = [];
    if (wound.flagged) {
      const comments = await WoundComment.findAll({
        where: { wound_id: wound.id },
        include: [{ 
          model: User, 
          as: 'admin', 
          attributes: ['id', 'full_name', 'email'] 
        }],
        order: [['created_at', 'ASC']]
      });
      
      adminComments = comments.map(comment => ({
        id: comment.id,
        comment: comment.comment,
        createdAt: comment.created_at,
        admin: comment.admin
      }));
    }
    
    res.json({ ...wound.toJSON(), adminComments });
  } catch (err) {
    console.error('Error fetching wound:', err);
    res.status(500).json({ error: 'Failed to fetch wound.' });
  }
};

// Update a wound
export const updateWound = async (req, res) => {
  try {
    const wound = await Wound.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!wound) return res.status(404).json({ error: 'Wound not found.' });
    await wound.update(req.body);
    res.json(wound);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update wound.' });
  }
};

// Delete a wound
export const deleteWound = async (req, res) => {
  try {
    const wound = await Wound.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!wound) return res.status(404).json({ error: 'Wound not found.' });
    await wound.destroy();
    res.json({ message: 'Wound deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete wound.' });
  }
};

// Add a wound log
export const addWoundLog = async (req, res) => {
  try {
    const { photo_url, notes } = req.body;
    const wound = await Wound.findOne({ where: { id: req.params.woundId, user_id: req.user.id } });
    if (!wound) return res.status(404).json({ error: 'Wound not found.' });
    const log = await WoundLog.create({
      wound_id: wound.id,
      photo_url,
      notes
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add wound log.' });
  }
};

// Get logs for a wound
export const getWoundLogs = async (req, res) => {
  try {
    const wound = await Wound.findOne({ where: { id: req.params.woundId, user_id: req.user.id } });
    if (!wound) return res.status(404).json({ error: 'Wound not found.' });
    const logs = await WoundLog.findAll({ where: { wound_id: wound.id } });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wound logs.' });
  }
};

// Get admin comments for a user's wound
export const getWoundAdminComments = async (req, res) => {
  try {
    // Verify the wound belongs to the user
    const wound = await Wound.findOne({ 
      where: { 
        id: req.params.id, 
        user_id: req.user.id 
      } 
    });
    
    if (!wound) {
      return res.status(404).json({ error: 'Wound not found.' });
    }
    
    // Get admin comments for this wound
    const comments = await WoundComment.findAll({
      where: { wound_id: req.params.id },
      include: [{ 
        model: User, 
        as: 'admin', 
        attributes: ['id', 'full_name', 'email'] 
      }],
      order: [['created_at', 'ASC']]
    });
    
    // Transform the response to match frontend expectations
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      comment: comment.comment,
      createdAt: comment.created_at,
      admin: comment.admin
    }));
    
    res.json(transformedComments);
  } catch (err) {
    console.error('Error fetching wound admin comments:', err);
    res.status(500).json({ error: 'Failed to fetch admin comments.' });
  }
}; 