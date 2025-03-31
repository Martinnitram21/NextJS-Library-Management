'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
    coverImage: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminBorrowings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'BORROWED' | 'RETURNED' | 'OVERDUE' | ''>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchBorrowings();
  }, [session, status, router]);

  const fetchBorrowings = async () => {
    try {
      const response = await fetch('/api/admin/borrowings');
      if (!response.ok) {
        throw new Error('Failed to fetch borrowings');
      }
      const data = await response.json();
      setBorrowings(data);
    } catch (error) {
      setError('Failed to load borrowings');
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
        throw new Error('Failed to return book');
      }

      // Refresh borrowings list
      fetchBorrowings();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to return book');
    }
  };

  const filteredBorrowings = borrowings.filter(borrowing => {
    const matchesSearch = 
      borrowing.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !selectedStatus || borrowing.status === selectedStatus;
    
    const matchesDateRange = (!dateRange.start || new Date(borrowing.borrowDate) >= new Date(dateRange.start)) &&
                           (!dateRange.end || new Date(borrowing.borrowDate) <= new Date(dateRange.end));
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Borrowing History</h1>
        <Link
          href="/admin"
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by book title, author, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'BORROWED' | 'RETURNED' | 'OVERDUE' | '')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="BORROWED">Borrowed</option>
            <option value="RETURNED">Returned</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Borrowed Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBorrowings.map((borrowing) => (
              <tr key={borrowing.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {borrowing.book.coverImage && (
                      <img
                        src={borrowing.book.coverImage}
                        alt={borrowing.book.title}
                        className="h-10 w-10 rounded-md object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{borrowing.book.title}</div>
                      <div className="text-sm text-gray-500">{borrowing.book.author}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{borrowing.user.name}</div>
                    <div className="text-sm text-gray-500">{borrowing.user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(borrowing.borrowDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(borrowing.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      borrowing.status === 'BORROWED'
                        ? 'bg-green-100 text-green-800'
                        : borrowing.status === 'OVERDUE'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {borrowing.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {(borrowing.status === 'BORROWED' || borrowing.status === 'OVERDUE') && (
                    <button
                      onClick={() => handleReturn(borrowing.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBorrowings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No borrowings found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 