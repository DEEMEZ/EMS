// src/app/layout.tsx
'use client';

import '@/app/globals.css';
import AuthProvider from '@/components/providers/SessionProvider';
import NavbarComponent from '@/components/navbar/navbar'; // Adjust path as needed

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          {/* Only include ONE navbar component here */}
          <NavbarComponent />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}