import { Clinic } from '../models/index.js';
import { Op } from 'sequelize';

// List all clinics with optional search
export const getClinics = async (req, res) => {
  try {
    const { search, city, country } = req.query;
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { address: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (city) where.city = city;
    if (country) where.country = country;
    
    const clinics = await Clinic.findAll({ where });
    res.json(clinics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clinics.' });
  }
};

// Get a single clinic
export const getClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found.' });
    res.json(clinic);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clinic.' });
  }
};

// Create a new clinic (admin only)
export const createClinic = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    
    const clinic = await Clinic.create(req.body);
    res.status(201).json(clinic);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create clinic.' });
  }
};

// Update a clinic (admin only)
export const updateClinic = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found.' });
    
    await clinic.update(req.body);
    res.json(clinic);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update clinic.' });
  }
};

// Delete a clinic (admin only)
export const deleteClinic = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found.' });
    
    await clinic.destroy();
    res.json({ message: 'Clinic deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete clinic.' });
  }
};

// Find nearby clinics
export const findNearby = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in km
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    // Rough distance calculation using PostgreSQL
    const clinics = await Clinic.findAll({
      where: sequelize.literal(`
        point(longitude, latitude) <@> point(${longitude}, ${latitude}) <= ${radius}
      `),
      order: [[sequelize.literal(`point(longitude, latitude) <@> point(${longitude}, ${latitude})`), 'ASC']]
    });
    
    res.json(clinics);
  } catch (err) {
    res.status(500).json({ error: 'Failed to find nearby clinics.' });
  }
}; 