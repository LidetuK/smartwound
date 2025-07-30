import { sendSupportEmail } from '../services/emailService.js';

// Send support email
export const sendSupport = async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required.' });
    }

    const userInfo = {
      id: req.user.id,
      full_name: req.user.full_name,
      email: req.user.email
    };

    const result = await sendSupportEmail(userInfo, subject, message);
    
    if (result.success) {
      res.json({ 
        message: 'Support email sent successfully!',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to send support email.',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Support email error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
