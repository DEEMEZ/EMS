// src/app/(protected)/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If the user is not authenticated, redirect to signin
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p>Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  // If authenticated, show the protected content
  if (status === 'authenticated') {
    return <>{children}</>;
  }

  // Return null while redirecting to prevent flash of unauthenticated content
  return null;
}