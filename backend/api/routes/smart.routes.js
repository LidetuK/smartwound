import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { 
    getMyReminders, 
    markReminderAsComplete,
    getEscalations,
    createReminderForInactiveUsers,
    createEscalationForProblemWounds
} from '../controllers/smartController.js';

const router = Router();

// --- User-facing routes ---
router.get('/reminders/me', verifyToken, getMyReminders);
router.put('/reminders/:id/complete', verifyToken, markReminderAsComplete);

// --- Admin/Doctor routes ---
router.get('/escalations', verifyToken, getEscalations);

// --- Cron Job Route ---
// This endpoint should be protected and only called by a trusted scheduler (e.g., Vercel Cron)
router.post('/run-jobs', async (req, res) => {
    // Optional: Add a secret key check for security
    // const { secret } = req.query;
    // if (secret !== process.env.CRON_SECRET) {
    //     return res.status(401).send('Unauthorized');
    // }

    try {
        console.log('Running smart service jobs...');
        await createReminderForInactiveUsers();
        await createEscalationForProblemWounds();
        console.log('Smart service jobs completed.');
        res.status(200).send('Cron jobs executed successfully.');
    } catch (error) {
        console.error('Cron job execution failed:', error);
        res.status(500).send('Cron job execution failed.');
    }
});

export default router; 