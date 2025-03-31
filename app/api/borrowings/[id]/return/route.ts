import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const borrowing = await prisma.borrowing.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!borrowing) {
      return NextResponse.json(
        { message: 'Borrowing not found' },
        { status: 404 }
      );
    }

    if (borrowing.userId !== session.user.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (borrowing.status !== 'BORROWED' && borrowing.status !== 'OVERDUE') {
      return NextResponse.json(
        { message: 'Book has already been returned' },
        { status: 400 }
      );
    }

    const [updatedBorrowing] = await prisma.$transaction([
      prisma.borrowing.update({
        where: {
          id: params.id,
        },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
        },
      }),
      prisma.book.update({
        where: {
          id: borrowing.bookId,
        },
        data: {
          availableCopies: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json(updatedBorrowing);
  } catch (error) {
    console.error('Error returning book:', error);
    return NextResponse.json(
      { message: 'Error returning book' },
      { status: 500 }
    );
  }
} 