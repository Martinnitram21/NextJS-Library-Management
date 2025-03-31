import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendDueDateReminderEmail, sendOverdueNotificationEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Verify cron job secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active borrowings
    const borrowings = await prisma.borrowing.findMany({
      where: {
        status: {
          in: ['BORROWED', 'OVERDUE'],
        },
      },
      include: {
        book: true,
        user: true,
      },
    });

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Process each borrowing
    for (const borrowing of borrowings) {
      const dueDate = new Date(borrowing.dueDate);
      const isOverdue = dueDate < now;
      const isDueSoon = dueDate <= threeDaysFromNow && dueDate > now;

      if (isOverdue && borrowing.status === 'BORROWED') {
        // Update status to OVERDUE
        await prisma.borrowing.update({
          where: { id: borrowing.id },
          data: { status: 'OVERDUE' },
        });

        // Send overdue notification
        await sendOverdueNotificationEmail(
          borrowing.user.email,
          borrowing.book.title,
          dueDate
        );
      } else if (isDueSoon) {
        // Send reminder email
        await sendDueDateReminderEmail(
          borrowing.user.email,
          borrowing.book.title,
          dueDate
        );
      }
    }

    return NextResponse.json({ message: 'Overdue check completed successfully' });
  } catch (error) {
    console.error('Error checking overdue books:', error);
    return NextResponse.json(
      { message: 'Error checking overdue books' },
      { status: 500 }
    );
  }
} 