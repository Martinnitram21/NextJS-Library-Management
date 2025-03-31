import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import {
  sendPasswordResetEmail,
  sendBorrowingConfirmationEmail,
  sendDueDateReminderEmail,
  sendOverdueNotificationEmail,
} from '../../../../lib/email';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Test all email types
    const results = {
      passwordReset: await sendPasswordResetEmail(email, 'test-reset-token'),
      borrowingConfirmation: await sendBorrowingConfirmationEmail(
        email,
        'Test Book Title',
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      ),
      dueDateReminder: await sendDueDateReminderEmail(
        email,
        'Test Book Title',
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      ),
      overdueNotification: await sendOverdueNotificationEmail(
        email,
        'Test Book Title',
        new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      ),
    };

    return NextResponse.json({
      message: 'Email tests completed',
      results,
    });
  } catch (error) {
    console.error('Error testing emails:', error);
    return NextResponse.json(
      { message: 'Error testing emails' },
      { status: 500 }
    );
  }
} 