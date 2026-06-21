import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummykey123');

const sendEmail = async ({ to, subject, html }) => {
  // If no API key is configured, just log to the console (development fallback)
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_api_key_here') {
    console.log('\n======================================================');
    console.log('📧 DEVELOPMENT MODE EMAIL SIMULATOR');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${html}`);
    console.log('======================================================\n');
    return { success: true, message: 'Email logged to console' };
  }

  try {
    const data = await resend.emails.send({
      from: 'InterviewAI <onboarding@resend.dev>', // Update this when you have a verified domain
      to: [to],
      subject: subject,
      html: html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;
