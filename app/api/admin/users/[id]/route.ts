import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user exists and has no active borrowings
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      include: {
        borrowings: {
          where: {
            status: {
              in: ['BORROWED', 'OVERDUE'],
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.borrowings.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete user with active borrowings' },
        { status: 400 }
      );
    }

    // Delete the user
    await prisma.user.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Error deleting user' },
      { status: 500 }
    );
  }
} 