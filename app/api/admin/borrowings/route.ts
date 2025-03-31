import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const borrowings = await prisma.borrowing.findMany({
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        borrowDate: 'desc',
      },
    });

    // Update status to OVERDUE if due date has passed
    const updatedBorrowings = await Promise.all(
      borrowings.map(async (borrowing) => {
        if (borrowing.status === 'BORROWED' && new Date(borrowing.dueDate) < new Date()) {
          return prisma.borrowing.update({
            where: { id: borrowing.id },
            data: { status: 'OVERDUE' },
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                  coverImage: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          });
        }
        return borrowing;
      })
    );

    return NextResponse.json(updatedBorrowings);
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    return NextResponse.json(
      { message: 'Error fetching borrowings' },
      { status: 500 }
    );
  }
} 