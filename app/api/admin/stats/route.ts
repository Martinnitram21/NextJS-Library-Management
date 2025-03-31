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

    const [
      totalBooks,
      totalUsers,
      activeBorrowings,
      overdueBorrowings,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.user.count(),
      prisma.borrowing.count({
        where: {
          status: 'BORROWED',
        },
      }),
      prisma.borrowing.count({
        where: {
          status: 'OVERDUE',
        },
      }),
    ]);

    return NextResponse.json({
      totalBooks,
      totalUsers,
      activeBorrowings,
      overdueBorrowings,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { message: 'Error fetching admin statistics' },
      { status: 500 }
    );
  }
} 