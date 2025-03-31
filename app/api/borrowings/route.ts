import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { sendBorrowingConfirmationEmail } from '../../../lib/email';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { bookId } = await request.json();

    if (!bookId) {
      return NextResponse.json(
        { message: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      );
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json(
        { message: 'Book is not available for borrowing' },
        { status: 400 }
      );
    }

    // Check if user already has an active borrowing for this book
    const existingBorrowing = await prisma.borrowing.findFirst({
      where: {
        userId: session.user.id,
        bookId: bookId,
        status: {
          in: ['BORROWED', 'OVERDUE'],
        },
      },
    });

    if (existingBorrowing) {
      return NextResponse.json(
        { message: 'You have already borrowed this book' },
        { status: 400 }
      );
    }

    // Create borrowing record and update book availability
    const [borrowing] = await prisma.$transaction([
      prisma.borrowing.create({
        data: {
          user: {
            connect: {
              id: session.user.id
            }
          },
          book: {
            connect: {
              id: bookId
            }
          },
          borrowDate: new Date(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          status: 'BORROWED',
        },
      }),
      prisma.book.update({
        where: {
          id: bookId,
        },
        data: {
          availableCopies: {
            decrement: 1,
          },
        },
      }),
    ]);

    // Send confirmation email
    await sendBorrowingConfirmationEmail(
      session.user.email,
      book.title,
      borrowing.dueDate
    );

    return NextResponse.json(borrowing);
  } catch (error) {
    console.error('Error borrowing book:', error);
    return NextResponse.json(
      { message: 'Error borrowing book' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const borrowings = await prisma.borrowing.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        book: true,
      },
      orderBy: {
        borrowDate: 'desc',
      },
    });

    return NextResponse.json(borrowings);
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return NextResponse.json(
      { message: 'Error fetching borrowings' },
      { status: 500 }
    );
  }
} 