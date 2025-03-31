'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  description: string | null;
  coverImage: string | null;
  totalCopies: number;
  availableCopies: number;
}

export default function BookPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBook();
  }, [params.id]);

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch book');
      }
      const data = await response.json();
      setBook(data);
    } catch (error) {
      setError('Error loading book');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setIsBorrowing(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/borrowings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: params.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to borrow book');
      }

      // Show success message
      setSuccessMessage('Book borrowed successfully! You can find it in your My Books section.');
      
      // Refresh book data
      fetchBook();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error borrowing book');
    } finally {
      setIsBorrowing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Book not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/books"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Books
        </Link>
      </div>

      {successMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-green-100 text-green-700 rounded-md shadow-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {book.coverImage && (
            <div className="md:w-1/3">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">By {book.author}</p>
            <div className="mb-4">
              <p className="text-gray-600">ISBN: {book.isbn}</p>
              <p className="text-gray-600">Published Year: {book.publishedYear}</p>
              <p className="text-gray-600">Genre: {book.genre}</p>
              <p className="text-gray-600">Available Copies: {book.availableCopies}</p>
            </div>
            {book.description && (
              <p className="text-gray-700 mb-6">{book.description}</p>
            )}
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            {session?.user && book.availableCopies > 0 && (
              <button
                onClick={handleBorrow}
                disabled={isBorrowing}
                className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                  isBorrowing
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isBorrowing ? 'Borrowing...' : 'Borrow Book'}
              </button>
            )}
            
            {!session && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Please sign in to borrow this book</p>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                  Sign In
                </button>
              </div>
            )}
            
            {session?.user && book.availableCopies <= 0 && (
              <div className="text-center text-gray-600">
                This book is currently not available for borrowing
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 