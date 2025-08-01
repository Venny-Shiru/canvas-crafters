import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  // For development, use Ethereal (fake SMTP)
  // For production, use a real email service like Gmail, SendGrid, etc.
  
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransport({
      service: 'gmail', // or your preferred service
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development: Use Ethereal fake SMTP
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
        pass: process.env.ETHEREAL_PASS || 'ethereal.pass'
      }
    });
  }
};

// Send email function
export const sendEmail = async (options) => {
  // For development, just log the email instead of actually sending it
  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 [DEV MODE] Email would be sent:');
    console.log('📧 To:', options.email);
    console.log('📧 Subject:', options.subject);
    console.log('📧 Message:', options.message);
    console.log('📧 HTML:', options.html);
    return { messageId: 'dev-mode-' + Date.now() };
  }

  const transporter = createTransporter();

  const message = {
    from: process.env.EMAIL_FROM || 'Canvas Crafters <noreply@canvascrafters.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(message);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Email sent to:', options.email);
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Email could not be sent');
  }
};

// Password reset email template
export const getPasswordResetEmailTemplate = (name, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Canvas Crafters</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
            .content { background: white; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .button:hover { background: #1d4ed8; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            .warning { background: #fef3cd; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🎨 Canvas Crafters</div>
            </div>
            
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hello ${name},</p>
                <p>You requested a password reset for your Canvas Crafters account. Click the button below to reset your password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                        <li>This link will expire in 10 minutes</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Never share this link with anyone</li>
                    </ul>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            </div>
            
            <div class="footer">
                <p>This email was sent by Canvas Crafters</p>
                <p>If you have any questions, please contact our support team</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
    Password Reset Request - Canvas Crafters
    
    Hello ${name},
    
    You requested a password reset for your Canvas Crafters account.
    
    Please click this link to reset your password:
    ${resetUrl}
    
    Important:
    - This link will expire in 10 minutes
    - If you didn't request this reset, please ignore this email
    - Never share this link with anyone
    
    If you have any questions, please contact our support team.
    
    Canvas Crafters Team
  `;

  return { html, text };
};
