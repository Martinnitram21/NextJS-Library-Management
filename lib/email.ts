import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    console.log('Attempting to send email to:', to);
    console.log('Using SMTP host:', process.env.SMTP_HOST);
    
    const info = await transporter.sendMail({
      from: `"Library Management System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: (error as any).code,
        command: (error as any).command,
      });
    }
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>Library Management System</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
  });
}

export async function sendBorrowingConfirmationEmail(email: string, bookTitle: string, dueDate: Date) {
  const formattedDueDate = new Date(dueDate).toLocaleDateString();
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Book Borrowing Confirmation</h2>
      <p>Hello,</p>
      <p>You have successfully borrowed the following book:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Book:</strong> ${bookTitle}</p>
        <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${formattedDueDate}</p>
      </div>
      <p>Please make sure to return the book by the due date to avoid any late fees.</p>
      <p>Best regards,<br>Library Management System</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Book Borrowing Confirmation',
    html,
  });
}

export async function sendDueDateReminderEmail(email: string, bookTitle: string, dueDate: Date) {
  const formattedDueDate = new Date(dueDate).toLocaleDateString();
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Book Due Date Reminder</h2>
      <p>Hello,</p>
      <p>This is a reminder that the following book is due soon:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Book:</strong> ${bookTitle}</p>
        <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${formattedDueDate}</p>
      </div>
      <p>Please return the book by the due date to avoid any late fees.</p>
      <p>Best regards,<br>Library Management System</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Book Due Date Reminder',
    html,
  });
}

export async function sendOverdueNotificationEmail(email: string, bookTitle: string, dueDate: Date) {
  const formattedDueDate = new Date(dueDate).toLocaleDateString();
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Overdue Book Notice</h2>
      <p>Hello,</p>
      <p>The following book is overdue:</p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Book:</strong> ${bookTitle}</p>
        <p style="margin: 10px 0 0;"><strong>Due Date:</strong> ${formattedDueDate}</p>
      </div>
      <p>Please return the book as soon as possible to avoid any additional late fees.</p>
      <p>Best regards,<br>Library Management System</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Overdue Book Notice',
    html,
  });
} 