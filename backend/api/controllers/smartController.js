import { Op } from 'sequelize';
import { Reminder, Wound, Escalation, User } from '../models/index.js';

// --- Reminder Service ---

/**
 * Creates reminders for users who haven't logged a wound in a while.
 * @returns {Promise<void>}
 */
export const createReminderForInactiveUsers = async () => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // Find all open wounds that haven't had a log in the last 3 days
  const inactiveWounds = await Wound.findAll({
    where: {
      status: 'open',
      updated_at: { [Op.lt]: threeDaysAgo }
    },
    include: [{ model: User, attributes: ['id'] }]
  });

  for (const wound of inactiveWounds) {
    // Check if a reminder for this already exists
    const existingReminder = await Reminder.findOne({
      where: { user_id: wound.user.id, is_completed: false }
    });

    if (!existingReminder) {
      await Reminder.create({
        user_id: wound.user.id,
        message: `You haven't updated your wound log for '${wound.type}' in a few days. Time for a check-in!`,
        due_date: new Date()
      });
    }
  }
};


// --- Escalation Service ---

/**
 * Creates escalations for wounds that are severe or not healing.
 * @returns {Promise<void>}
 */
export const createEscalationForProblemWounds = async () => {
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  // 1. Escalate wounds marked as 'severe'
  const severeWounds = await Wound.findAll({
    where: { severity: 'severe', status: 'open' }
  });
  
  for (const wound of severeWounds) {
    const existingEscalation = await Escalation.findOne({ where: { wound_id: wound.id } });
    if (!existingEscalation) {
      await Escalation.create({
        wound_id: wound.id,
        reason: 'Wound identified as severe by AI analysis.'
      });
    }
  }

  // 2. Escalate wounds that haven't been updated in 5+ days
  const nonHealingWounds = await Wound.findAll({
    where: {
      status: 'open',
      created_at: { [Op.lt]: fiveDaysAgo } // Only for wounds older than 5 days
    }
  });

  for (const wound of nonHealingWounds) {
      const latestLog = await Wound.findOne({
          where: {id: wound.id},
          include: [{model: WoundLog, order: [['created_at', 'DESC']], limit: 1}]
      });

      if (!latestLog || new Date(latestLog.created_at) < fiveDaysAgo) {
          const existingEscalation = await Escalation.findOne({ where: { wound_id: wound.id } });
          if (!existingEscalation) {
              await Escalation.create({
                  wound_id: wound.id,
                  reason: 'No improvement or log update in over 5 days.'
              });
          }
      }
  }
};


// --- API Controller Functions ---

export const getMyReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      where: { user_id: req.user.id, is_completed: false },
      order: [['due_date', 'ASC']]
    });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders.' });
  }
};

export const markReminderAsComplete = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }
    
    await reminder.update({ is_completed: true });
    res.json({ message: 'Reminder marked as complete.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reminder.' });
  }
};

export const getEscalations = async (req, res) => {
    if(req.user.role !== 'admin' && req.user.role !== 'doctor'){
        return res.status(403).json({ error: 'You are not authorized to view escalations.' });
    }

  try {
    const escalations = await Escalation.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Wound,
          include: [User]
        }
      ],
      order: [['created_at', 'ASC']]
    });
    res.json(escalations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch escalations.' });
  }
}; 