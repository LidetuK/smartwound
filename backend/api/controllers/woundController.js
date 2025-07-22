import { Wound, WoundLog } from '../models/index.js';

// Create a new wound
export const createWound = async (req, res) => {
  try {
    const { type, severity, image_url, status } = req.body;
    const wound = await Wound.create({
      user_id: req.user.id,
      type,
      severity,
      image_url,
      status
    });
    res.status(201).json(wound);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create wound.' });
  }
};

// Get all wounds for current user
export const getWounds = async (req, res) => {
  try {
    const wounds = await Wound.findAll({ where: { user_id: req.user.id } });
    res.json(wounds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wounds.' });
  }
};

// Get a single wound
export const getWound = async (req, res) => {
  try {
    const wound = await Wound.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!wound) return res.status(404).json({ error: 'Wound not found.' });
    res.json(wound);
  } catch (err) {
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