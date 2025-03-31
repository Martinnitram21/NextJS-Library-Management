'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  description: string;
  coverImage: string | null;
  totalCopies: number;
  availableCopies: number;
}

interface ToastMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function Books() {
  const { data: session } = useSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookId: string | null;
  }>({ isOpen: false, bookId: null });
  const [isBorrowing, setIsBorrowing] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();
      setBooks(data);
      
      // Extract unique genres
      const uniqueGenres = Array.from(new Set(data.map((book: Book) => book.genre)));
      setGenres(uniqueGenres);
    } catch (error) {
      setError('Failed to load books');
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBorrowClick = (bookId: string) => {
    setConfirmDialog({ isOpen: true, bookId });
  };

  const handleBorrow = async () => {
    if (!confirmDialog.bookId) return;

    setIsBorrowing(true);
    try {
      const response = await fetch('/api/borrowings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId: confirmDialog.bookId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to borrow book');
      }

      setToast({
        type: 'success',
        message: 'Book borrowed successfully! You can find it in your My Books section.',
      });
      
      // Refresh books list
      fetchBooks();
    } catch (error) {
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to borrow book',
      });
    } finally {
      setIsBorrowing(false);
      setConfirmDialog({ isOpen: false, bookId: null });
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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

  return (
    <div className="container mx-auto px-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Borrow Book"
        message="Are you sure you want to borrow this book? You will have 14 days to return it."
        confirmText="Borrow"
        cancelText="Cancel"
        onConfirm={handleBorrow}
        onCancel={() => setConfirmDialog({ isOpen: false, bookId: null })}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Books</h1>
        <p className="mt-2 text-gray-600">Browse and borrow books from our collection</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            {book.coverImage && (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {book.title}
              </h3>
              <p className="text-gray-600 mb-2">By {book.author}</p>
              <p className="text-sm text-gray-500 mb-2">Genre: {book.genre}</p>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  Available: {book.availableCopies} of {book.totalCopies}
                </p>
                {book.availableCopies > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                )}
              </div>
              {session?.user && book.availableCopies > 0 ? (
                <button
                  onClick={() => handleBorrowClick(book.id)}
                  disabled={isBorrowing}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
                    isBorrowing
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isBorrowing ? 'Processing...' : 'Borrow'}
                </button>
              ) : !session ? (
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  Sign in to Borrow
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2 px-4 bg-gray-400 text-white rounded-md cursor-not-allowed"
                >
                  Not Available
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 