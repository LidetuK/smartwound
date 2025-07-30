import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Gmail address for sending
      pass: process.env.EMAIL_PASS  // Gmail app password
    }
  });
};

// Send support email
export const sendSupportEmail = async (userInfo, subject, message) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'mikianmaw@gmail.com',
      subject: `[SmartWound Support] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">SmartWound Support Request</h2>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">User Information:</h3>
            <p><strong>Name:</strong> ${userInfo.full_name}</p>
            <p><strong>Email:</strong> ${userInfo.email}</p>
            <p><strong>User ID:</strong> ${userInfo.id}</p>
          </div>
          
          <div style="background-color: #FFFFFF; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #EFF6FF; border-radius: 8px; border-left: 4px solid #3B82F6;">
            <p style="margin: 0; color: #1E40AF; font-size: 14px;">
              This email was sent automatically from the SmartWound support system.
            </p>
          </div>
        </div>
      `,
      replyTo: userInfo.email // Allow direct reply to user
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};
