'use client';

import SessionProvider from './SessionProvider';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
} 