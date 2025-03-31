import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { message: 'Error fetching books' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.author || !data.isbn || !data.publishedYear || !data.genre || !data.totalCopies) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        publishedYear: data.publishedYear,
        genre: data.genre,
        description: data.description || '',
        coverImage: data.coverImage || '',
        totalCopies: data.totalCopies,
        availableCopies: data.totalCopies,
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { message: 'Error creating book' },
      { status: 500 }
    );
  }
} 