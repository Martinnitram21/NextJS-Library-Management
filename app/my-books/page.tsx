'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Borrowing {
  id: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    coverImage: string | null;
  };
}

export default function MyBooks() {
  const { data: session } = useSession();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchBorrowings();
    }
  }, [session]);

  const fetchBorrowings = async () => {
    try {
      const response = await fetch('/api/borrowings/my-books');
      if (!response.ok) {
        throw new Error('Failed to fetch borrowings');
      }
      const data = await response.json();
      setBorrowings(data);
    } catch (error) {
      setError('Failed to load your borrowed books');
      console.error('Error fetching borrowings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (borrowingId: string) => {
    try {
      const response = await fetch(`/api/borrowings/${borrowingId}/return`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to return book');
      }

      // Refresh borrowings list
      fetchBorrowings();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to return book');
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Books</h1>
          <p className="text-gray-600 mb-4">Please sign in to view your borrowed books.</p>
          <Link
            href="/auth/signin"
            className="text-blue-600 hover:text-blue-800"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">{error}</h2>
      </div>
    );
  }

  const activeBorrowings = borrowings.filter(b => b.status === 'BORROWED');
  const overdueBorrowings = borrowings.filter(b => b.status === 'OVERDUE');
  const returnedBorrowings = borrowings.filter(b => b.status === 'RETURNED');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Books</h1>

      {/* Active Borrowings */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Currently Borrowed</h2>
        {activeBorrowings.length === 0 ? (
          <p className="text-gray-500">No books currently borrowed.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBorrowings.map((borrowing) => (
              <div
                key={borrowing.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {borrowing.book.coverImage && (
                  <img
                    src={borrowing.book.coverImage}
                    alt={borrowing.book.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {borrowing.book.title}
                  </h3>
                  <p className="text-gray-600 mb-2">By {borrowing.book.author}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Borrowed on: {new Date(borrowing.borrowDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Due on: {new Date(borrowing.dueDate).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleReturn(borrowing.id)}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Return Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overdue Books */}
      {overdueBorrowings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Overdue Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overdueBorrowings.map((borrowing) => (
              <div
                key={borrowing.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-red-500"
              >
                {borrowing.book.coverImage && (
                  <img
                    src={borrowing.book.coverImage}
                    alt={borrowing.book.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {borrowing.book.title}
                  </h3>
                  <p className="text-gray-600 mb-2">By {borrowing.book.author}</p>
                  <p className="text-sm text-red-600 mb-2">
                    Overdue since: {new Date(borrowing.dueDate).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleReturn(borrowing.id)}
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Return Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Returned Books */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Returned Books</h2>
        {returnedBorrowings.length === 0 ? (
          <p className="text-gray-500">No returned books.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {returnedBorrowings.map((borrowing) => (
              <div
                key={borrowing.id}
                className="bg-white rounded-lg shadow-md overflow-hidden opacity-75"
              >
                {borrowing.book.coverImage && (
                  <img
                    src={borrowing.book.coverImage}
                    alt={borrowing.book.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {borrowing.book.title}
                  </h3>
                  <p className="text-gray-600 mb-2">By {borrowing.book.author}</p>
                  <p className="text-sm text-gray-500">
                    Returned on: {new Date(borrowing.returnDate!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 