'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import NotificationBell from './NotificationBell';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Library Management</span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/books" className="inline-flex items-center px-1 pt-1 text-gray-900">
                Books
              </Link>
              {session?.user && (
                <Link href="/my-books" className="inline-flex items-center px-1 pt-1 text-gray-900">
                  My Books
                </Link>
              )}
              {session?.user?.role === 'ADMIN' && (
                <Link href="/admin" className="inline-flex items-center px-1 pt-1 text-gray-900">
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex md:items-center">
            {session?.user && (
              <>
                <NotificationBell />
                <div className="ml-4">
                  <button
                    onClick={() => signOut()}
                    className="text-gray-900 hover:text-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/books"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-gray-700 hover:bg-gray-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Books
          </Link>
          {session?.user && (
            <Link
              href="/my-books"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Books
            </Link>
          )}
          {session?.user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin
            </Link>
          )}
          {session?.user ? (
            <>
              <div className="px-3 py-2">
                <NotificationBell />
              </div>
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-gray-700 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 