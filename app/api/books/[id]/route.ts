import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
    });

    if (!book) {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { message: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      author,
      isbn,
      publishedYear,
      genre,
      description,
      coverImage,
      totalCopies,
    } = body;

    // Validate required fields
    if (!title || !author || !isbn || !publishedYear || !genre || !totalCopies) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: params.id },
    });

    if (!existingBook) {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      );
    }

    // Update book
    const updatedBook = await prisma.book.update({
      where: { id: params.id },
      data: {
        title,
        author,
        isbn,
        publishedYear,
        genre,
        description,
        coverImage,
        totalCopies,
      },
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { message: 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if book exists and has no active borrowings
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        borrowings: {
          where: {
            status: 'BORROWED',
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { message: 'Book not found' },
        { status: 404 }
      );
    }

    if (book.borrowings.length > 0) {
      return NextResponse.json(
        { message: 'Cannot delete book with active borrowings' },
        { status: 400 }
      );
    }

    // Delete book
    await prisma.book.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { message: 'Failed to delete book' },
      { status: 500 }
    );
  }
} 