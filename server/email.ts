import { MailService } from '@sendgrid/mail';

let mailService: MailService | null = null;

// Initialize SendGrid only if API key is available
if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!mailService) {
    console.warn('SendGrid not configured - email not sent');
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export function generateMeetingReminderEmail(
  meetingTitle: string,
  meetingTime: Date,
  meetingLink: string,
  meetingType: 'zoom' | 'meet'
): { subject: string; html: string; text: string } {
  const timeStr = meetingTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const platformName = meetingType === 'zoom' ? 'Zoom' : 'Google Meet';
  
  const subject = `Reminder: ${meetingTitle} starts in 30 minutes`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Study Group Meeting Reminder</h2>
      
      <p>Hello!</p>
      
      <p>This is a friendly reminder that your study group meeting is starting soon:</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0;">${meetingTitle}</h3>
        <p><strong>Time:</strong> ${timeStr}</p>
        <p><strong>Platform:</strong> ${platformName}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${meetingLink}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Join ${platformName} Meeting
        </a>
      </div>
      
      <p>We recommend joining a few minutes early to test your audio and video.</p>
      
      <p>Happy studying!</p>
      <p>The Docdot Team</p>
    </div>
  `;
  
  const text = `
Study Group Meeting Reminder

Hello!

This is a friendly reminder that your study group meeting is starting soon:

${meetingTitle}
Time: ${timeStr}
Platform: ${platformName}

Join the meeting: ${meetingLink}

We recommend joining a few minutes early to test your audio and video.

Happy studying!
The Docdot Team
  `;

  return { subject, html, text };
}